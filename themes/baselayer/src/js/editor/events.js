(function () {
  'use strict';

  const wp = typeof window !== 'undefined' ? window.wp : null;
  if (!wp || typeof baselayerEvents === 'undefined') {
    return;
  }

  const EVENT_TYPES =
    baselayerEvents.postTypes && Array.isArray(baselayerEvents.postTypes)
      ? baselayerEvents.postTypes
      : baselayerEvents.postType
        ? [baselayerEvents.postType]
        : [];
  if (!EVENT_TYPES.length) {
    return;
  }

  const el = wp.element.createElement;
  const Fragment = wp.element.Fragment;
  const { useState, useEffect, useMemo } = wp.element;
  const { useSelect } = wp.data;
  const { useEntityProp } = wp.coreData;
  const { registerPlugin } = wp.plugins;
  const { PluginDocumentSettingPanel } = wp.editor;
  const { PanelRow, ToggleControl, Button, Modal, SelectControl, TextControl, TextareaControl } = wp.components;

  const L = baselayerEvents;

  const META_START_DATE = '_bl_event_start_date';
  const META_END_DATE = '_bl_event_end_date';
  const META_START_TIME = '_bl_event_start_time';
  const META_END_TIME = '_bl_event_end_time';
  const META_RECURRENCE = '_bl_event_recurrence';
  const META_OCCURRENCE_OF = '_bl_event_occurrence_of';
  const META_DETACHED = '_bl_event_series_detached';
  const META_EXDATES = '_bl_event_exdates';
  const META_STATUS = '_bl_event_status';
  const META_STATUS_LABEL = '_bl_event_status_label';
  const META_STATUS_INFO = '_bl_event_status_info';
  const META_STATUS_COLOR = '_bl_event_status_color';

  const WEEKDAYS = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'];

  function parseRule(raw) {
    if (!raw || typeof raw !== 'string') {
      return null;
    }
    try {
      const data = JSON.parse(raw);
      if (!data || !data.freq) {
        return null;
      }
      return {
        freq: data.freq,
        interval: Math.max(1, parseInt(data.interval, 10) || 1),
        byweekday: Array.isArray(data.byweekday) ? data.byweekday.slice() : [],
        ends: data.ends || 'never',
        until: data.until || '',
        count: data.count != null && data.count !== '' ? parseInt(data.count, 10) : null,
      };
    } catch (e) {
      return null;
    }
  }

  function encodeRule(rule) {
    if (!rule || !rule.freq) {
      return '';
    }
    const payload = {
      freq: rule.freq,
      interval: Math.max(1, parseInt(rule.interval, 10) || 1),
      byweekday: rule.freq === 'weekly' ? rule.byweekday || [] : [],
      ends: rule.ends || 'never',
      until: rule.ends === 'on_date' ? rule.until || null : null,
      count: rule.ends === 'after' ? Math.max(1, parseInt(rule.count, 10) || 1) : null,
    };
    if (payload.freq === 'weekly' && (!payload.byweekday || !payload.byweekday.length)) {
      return '';
    }
    return JSON.stringify(payload);
  }

  function weekdayKeyFromDate(ymd) {
    if (!ymd) {
      return 'mo';
    }
    const d = new Date(ymd + 'T12:00:00');
    if (Number.isNaN(d.getTime())) {
      return 'mo';
    }
    return WEEKDAYS[(d.getDay() + 6) % 7];
  }

  function defaultRule(startDate) {
    return {
      freq: 'weekly',
      interval: 1,
      byweekday: [weekdayKeyFromDate(startDate)],
      ends: 'never',
      until: '',
      count: 10,
    };
  }

  function ymdLocal(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function addDays(ymd, days) {
    const d = new Date(ymd + 'T12:00:00');
    d.setDate(d.getDate() + days);
    return ymdLocal(d);
  }

  function spanDays(start, end) {
    if (!start || !end) {
      return 0;
    }
    const a = new Date(start + 'T12:00:00');
    const b = new Date(end + 'T12:00:00');
    return Math.max(0, Math.round((b - a) / 86400000));
  }

  function parseExdates(raw) {
    if (!raw || typeof raw !== 'string') {
      return [];
    }
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) {
        return [];
      }
      return data.filter(function (d) {
        return typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);
      });
    } catch (e) {
      return [];
    }
  }

  function expandOccurrences(rule, anchorStart, anchorEnd, horizon) {
    if (!rule || !anchorStart || !horizon) {
      return [];
    }
    const span = spanDays(anchorStart, anchorEnd || anchorStart);
    let until = horizon;
    if (rule.ends === 'on_date' && rule.until && rule.until < until) {
      until = rule.until;
    }
    const max = rule.ends === 'after' && rule.count ? Math.min(500, rule.count) : 500;
    const out = [];
    const interval = Math.max(1, rule.interval || 1);

    if (rule.freq === 'weekly') {
      const wanted = rule.byweekday || [];
      if (!wanted.length) {
        return [];
      }
      const start = new Date(anchorStart + 'T12:00:00');
      const n = (start.getDay() + 6) % 7;
      let cursor = new Date(start);
      cursor.setDate(cursor.getDate() - n);
      let weekIndex = 0;
      let guard = 0;
      while (guard < 5000 && out.length < max) {
        ++guard;
        const cursorYmd = ymdLocal(cursor);
        if (cursorYmd > until) {
          break;
        }
        if (weekIndex % interval === 0) {
          for (let i = 0; i < 7; i++) {
            const dayKey = WEEKDAYS[i];
            if (wanted.indexOf(dayKey) === -1) {
              continue;
            }
            const occ = new Date(cursor);
            occ.setDate(occ.getDate() + i);
            const occYmd = ymdLocal(occ);
            if (occYmd < anchorStart || occYmd > until) {
              continue;
            }
            out.push({
              start_date: occYmd,
              end_date: addDays(occYmd, span),
            });
            if (out.length >= max) {
              break;
            }
          }
        }
        cursor.setDate(cursor.getDate() + 7);
        ++weekIndex;
      }
      return out;
    }

    let cursor = anchorStart;
    let guard = 0;
    while (cursor <= until && out.length < max && guard < 5000) {
      ++guard;
      out.push({ start_date: cursor, end_date: addDays(cursor, span) });
      const d = new Date(cursor + 'T12:00:00');
      if (rule.freq === 'daily') {
        d.setDate(d.getDate() + interval);
      } else if (rule.freq === 'monthly') {
        const day = d.getDate();
        d.setMonth(d.getMonth() + interval);
        const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        d.setDate(Math.min(day, last));
      } else if (rule.freq === 'yearly') {
        d.setFullYear(d.getFullYear() + interval);
      } else {
        break;
      }
      cursor = ymdLocal(d);
    }
    return out;
  }

  function formatDisplayDate(ymd) {
    if (!ymd) {
      return '';
    }
    const d = new Date(ymd + 'T12:00:00');
    if (Number.isNaN(d.getTime())) {
      return ymd;
    }
    try {
      return d.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: undefined,
      });
    } catch (e) {
      return ymd;
    }
  }

  function summaryLines(rule) {
    if (!rule) {
      return [];
    }
    const freqMap = {
      daily: L.freqDaily || 'Daily',
      weekly: L.freqWeekly || 'Weekly',
      monthly: L.freqMonthly || 'Monthly',
      yearly: L.freqYearly || 'Yearly',
    };
    let freq = freqMap[rule.freq] || rule.freq;
    if (rule.interval > 1) {
      freq = everyIntervalLabel(rule.freq, rule.interval);
    }
    const lines = [freq];
    if (rule.freq === 'weekly' && rule.byweekday && rule.byweekday.length) {
      const labels = L.weekdayLabels || {};
      lines.push(
        rule.byweekday
          .map(function (k) {
            return labels[k] || k;
          })
          .join(', '),
      );
    }
    if (rule.ends === 'on_date' && rule.until) {
      lines.push((L.endsOnDate || 'Until') + ' ' + formatDisplayDate(rule.until));
    } else if (rule.ends === 'after' && rule.count) {
      lines.push((L.endsAfter || 'After') + ' ' + rule.count);
    }
    return lines;
  }

  function unitLabel(freq) {
    if (freq === 'daily') {
      return L.unitDay || 'day(s)';
    }
    if (freq === 'monthly') {
      return L.unitMonth || 'month(s)';
    }
    if (freq === 'yearly') {
      return L.unitYear || 'year(s)';
    }
    return L.unitWeek || 'week(s)';
  }

  function everyIntervalLabel(freq, interval) {
    const n = Math.max(1, parseInt(interval, 10) || 1);
    const templates = {
      daily: L.everyNDays || 'Every %d days',
      weekly: L.everyNWeeks || 'Every %d weeks',
      monthly: L.everyNMonths || 'Every %d months',
      yearly: L.everyNYears || 'Every %d years',
    };
    return (templates[freq] || templates.weekly).replace('%d', String(n));
  }

  function RecurrenceModal(props) {
    const { initialRule, startDate, endDate, exdates, onSave, onRequestClose } = props;
    const [draft, setDraft] = useState(function () {
      return initialRule ? Object.assign({}, initialRule) : defaultRule(startDate);
    });

    const hasStartDate = !!(startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate));
    const horizon = L.horizonDate || addDays(startDate || new Date().toISOString().slice(0, 10), 365);
    const excluded = Array.isArray(exdates) ? exdates : [];
    const upcoming = useMemo(
      function () {
        if (!hasStartDate) {
          return [];
        }
        return expandOccurrences(draft, startDate, endDate || startDate, horizon).filter(function (slot) {
          return excluded.indexOf(slot.start_date) === -1;
        });
      },
      [draft, startDate, endDate, horizon, hasStartDate, excluded.join(',')],
    );
    const preview = upcoming.slice(0, 4);
    const more = Math.max(0, upcoming.length - preview.length);

    function patch(next) {
      setDraft(Object.assign({}, draft, next));
    }

    function toggleDay(day) {
      const set = {};
      (draft.byweekday || []).forEach(function (d) {
        set[d] = true;
      });
      if (set[day]) {
        delete set[day];
      } else {
        set[day] = true;
      }
      patch({
        byweekday: WEEKDAYS.filter(function (d) {
          return set[d];
        }),
      });
    }

    return el(
      Modal,
      {
        title: L.modalTitle || 'Recurrence settings',
        onRequestClose: onRequestClose,
        className: 'bl-event-recurrence-modal',
      },
      el(
        'div',
        { className: 'bl-event-recurrence-modal__body' },
        el(
          'div',
          { className: 'bl-event-recurrence-modal__layout' },
          el(
            'div',
            { className: 'bl-event-recurrence-modal__settings' },
            el(
              'div',
              { className: 'bl-event-recurrence-modal__freq' },
              el('label', { className: 'bl-event-recurrence-modal__label' }, L.freqLabel || 'Repeats'),
              el(SelectControl, {
                hideLabelFromVision: true,
                label: L.freqLabel || 'Repeats',
                value: draft.freq,
                options: [
                  { label: L.freqDaily || 'Daily', value: 'daily' },
                  { label: L.freqWeekly || 'Weekly', value: 'weekly' },
                  { label: L.freqMonthly || 'Monthly', value: 'monthly' },
                  { label: L.freqYearly || 'Yearly', value: 'yearly' },
                ],
                onChange: function (freq) {
                  const next = { freq: freq };
                  if (freq === 'weekly' && (!draft.byweekday || !draft.byweekday.length)) {
                    next.byweekday = [weekdayKeyFromDate(startDate)];
                  }
                  patch(next);
                },
              }),
            ),
            el(
              'div',
              { className: 'bl-event-recurrence-modal__every' },
              el('label', { className: 'bl-event-recurrence-modal__label' }, L.everyLabel || 'Every'),
              el(
                'div',
                { className: 'bl-event-recurrence-modal__every-row' },
                el(TextControl, {
                  type: 'number',
                  min: 1,
                  max: 99,
                  value: String(draft.interval || 1),
                  onChange: function (v) {
                    patch({ interval: Math.max(1, parseInt(v, 10) || 1) });
                  },
                }),
                el('span', null, unitLabel(draft.freq)),
              ),
            ),
            draft.freq === 'weekly'
              ? el(
                  'div',
                  { className: 'bl-event-recurrence-modal__days' },
                  el('label', { className: 'bl-event-recurrence-modal__label' }, L.onLabel || 'On weekday'),
                  el(
                    'div',
                    { className: 'bl-event-recurrence-modal__days-row', role: 'group' },
                    WEEKDAYS.map(function (day) {
                      const labels = L.weekdayLabels || {};
                      const checked = (draft.byweekday || []).indexOf(day) !== -1;
                      return el(
                        Button,
                        {
                          key: day,
                          type: 'button',
                          variant: checked ? 'primary' : 'secondary',
                          className: 'bl-event-recurrence-modal__day' + (checked ? ' is-pressed' : ''),
                          'aria-pressed': checked,
                          onClick: function () {
                            toggleDay(day);
                          },
                        },
                        labels[day] || day,
                      );
                    }),
                  ),
                )
              : el('div', {
                  className: 'bl-event-recurrence-modal__days bl-event-recurrence-modal__days--spacer',
                  'aria-hidden': true,
                }),
            el(
              'div',
              { className: 'bl-event-recurrence-modal__ends' },
              el('label', { className: 'bl-event-recurrence-modal__label' }, L.endsLabel || 'Ends'),
              el(
                'div',
                { className: 'bl-event-recurrence-modal__ends-row', role: 'group' },
                [
                  { value: 'never', label: L.endsNever || 'Never' },
                  { value: 'on_date', label: L.endsOnDate || 'On date' },
                  { value: 'after', label: L.endsAfter || 'After' },
                ].map(function (opt) {
                  const checked = (draft.ends || 'never') === opt.value;
                  return el(
                    Button,
                    {
                      key: opt.value,
                      type: 'button',
                      variant: checked ? 'primary' : 'secondary',
                      className: 'bl-event-recurrence-modal__ends-option' + (checked ? ' is-pressed' : ''),
                      'aria-pressed': checked,
                      onClick: function () {
                        patch({ ends: opt.value });
                      },
                    },
                    opt.label,
                  );
                }),
              ),
              el(
                'div',
                { className: 'bl-event-recurrence-modal__ends-extra' },
                draft.ends === 'on_date'
                  ? el('input', {
                      type: 'date',
                      className: 'components-text-control__input',
                      value: draft.until || '',
                      min: startDate || undefined,
                      onChange: function (e) {
                        patch({ until: e.target.value });
                      },
                    })
                  : null,
                draft.ends === 'after'
                  ? el(
                      'div',
                      { className: 'bl-event-recurrence-modal__every-row' },
                      el(TextControl, {
                        type: 'number',
                        min: 1,
                        max: 999,
                        value: String(draft.count || 10),
                        onChange: function (v) {
                          patch({ count: Math.max(1, parseInt(v, 10) || 1) });
                        },
                      }),
                      el('span', null, L.occurrencesUnit || 'occurrences'),
                    )
                  : null,
              ),
            ),
          ),
          el(
            'div',
            { className: 'bl-event-recurrence-modal__preview' },
            el('strong', null, L.nextOccurrences || 'Next occurrences'),
            !hasStartDate
              ? el('p', { className: 'description' }, L.recurrenceNeedsDate || 'Set a start date to create occurrence posts.')
              : el(
                  Fragment,
                  null,
                  el(
                    'ul',
                    null,
                    preview.map(function (item) {
                      return el('li', { key: item.start_date }, formatDisplayDate(item.start_date));
                    }),
                  ),
                  more > 0 ? el('p', { className: 'description' }, (L.moreOccurrences || '+%d more').replace('%d', String(more))) : null,
                ),
          ),
        ),
        el(
          'div',
          { className: 'bl-event-recurrence-modal__footer' },
          el(
            Button,
            {
              variant: 'tertiary',
              isDestructive: true,
              onClick: function () {
                onSave('');
                onRequestClose();
              },
            },
            L.clearRecurrence || 'Stop repeating',
          ),
          el(
            'div',
            { className: 'bl-event-recurrence-modal__footer-actions' },
            el(Button, { variant: 'tertiary', onClick: onRequestClose }, L.cancelLabel || 'Cancel'),
            el(
              Button,
              {
                variant: 'primary',
                onClick: function () {
                  const encoded = encodeRule(draft);
                  if (!encoded && draft.freq === 'weekly') {
                    return;
                  }
                  onSave(encoded);
                  onRequestClose();
                },
              },
              L.saveLabel || 'Save',
            ),
          ),
        ),
      ),
    );
  }

  function EventPanelContent() {
    const postType = useSelect(function (select) {
      return select('core/editor')?.getCurrentPostType?.() || '';
    }, []);
    const postId = useSelect(function (select) {
      return select('core/editor')?.getCurrentPostId?.();
    }, []);
    const postParent = useSelect(function (select) {
      return select('core/editor')?.getEditedPostAttribute?.('parent') || 0;
    }, []);
    const currentPost = useSelect(
      function (select) {
        if (!postId || !postType) {
          return null;
        }
        return select('core').getEntityRecord('postType', postType, postId);
      },
      [postId, postType],
    );

    if (!postType || EVENT_TYPES.indexOf(postType) === -1 || !postId) {
      return null;
    }

    const [meta, setMeta] = useEntityProp('postType', postType, 'meta', postId);

    const startDate = (meta && meta[META_START_DATE]) || '';
    const endDate = (meta && meta[META_END_DATE]) || '';
    const startTime = (meta && meta[META_START_TIME]) || '';
    const endTime = (meta && meta[META_END_TIME]) || '';
    const recurrenceRaw = (meta && meta[META_RECURRENCE]) || '';
    const exdates = parseExdates((meta && meta[META_EXDATES]) || '');
    const occurrenceOf = parseInt(meta && meta[META_OCCURRENCE_OF], 10) || 0;
    const detached = !!(meta && meta[META_DETACHED] === '1');
    const isOccurrence = occurrenceOf > 0 || (postParent && postParent > 0);
    const masterId = occurrenceOf || postParent || 0;
    const rule = parseRule(recurrenceRaw);
    const hasStartDate = !!(startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate));
    const isSeriesMaster = !isOccurrence && !!rule;
    const showStatus = !isSeriesMaster;
    const statusKey = (meta && meta[META_STATUS]) || 'active';
    const statusCustomLabel = (meta && meta[META_STATUS_LABEL]) || '';
    const statusInfo = (meta && meta[META_STATUS_INFO]) || '';
    const statusColorDefault = L.statusColorDefault || 'info';
    const statusColorToken = (meta && meta[META_STATUS_COLOR]) || statusColorDefault;
    const statusColorPresets = Array.isArray(L.statusColorPresets) ? L.statusColorPresets : [];
    const statusColorOptions = statusColorPresets.map(function (opt) {
      return { label: opt.label, value: opt.key };
    });
    const statusColorHex = (function () {
      if (typeof document === 'undefined' || !document.documentElement) {
        return '';
      }
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue('--bl-color-' + statusColorToken)
        .trim();
      return raw || '';
    })();
    const statusOptions = (function () {
      const raw =
        (L.statusesByType && L.statusesByType[postType]) || L.statuses || [];
      return raw.map(function (opt) {
        return {
          label: opt.label,
          value: opt.key,
          disabled: !!opt.disabled,
        };
      });
    })();

    const masterRecord = useSelect(
      function (select) {
        if (!isOccurrence || !masterId) {
          return null;
        }
        return select('core').getEntityRecord('postType', postType, masterId);
      },
      [isOccurrence, masterId, postType],
    );

    const [timesEnabled, setTimesEnabled] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [reverting, setReverting] = useState(false);

    useEffect(
      function () {
        setTimesEnabled(!!(startTime || endTime));
      },
      [postId, startTime, endTime],
    );

    if (!meta || typeof setMeta !== 'function') {
      return null;
    }

    function patch(next) {
      setMeta(Object.assign({}, meta, next));
    }

    function onToggleTimes(on) {
      setTimesEnabled(on);
      if (!on) {
        patch({
          [META_START_TIME]: '',
          [META_END_TIME]: '',
        });
      }
    }

    const dateFieldsDisabled = !!isOccurrence;
    const occurrenceCount = currentPost && typeof currentPost.bl_occurrence_count === 'number' ? currentPost.bl_occurrence_count : null;
    const masterTitle = (currentPost && currentPost.bl_master_title) || (masterRecord && (masterRecord.title?.rendered || masterRecord.title?.raw)) || '';
    const masterEditUrl = (currentPost && currentPost.bl_master_edit_link) || (masterId ? 'post.php?post=' + masterId + '&action=edit' : '');

    function revertToMaster() {
      if (!L.revertRestUrl || reverting) {
        return;
      }
      setReverting(true);
      window
        .fetch(L.revertRestUrl + postId, {
          method: 'POST',
          headers: {
            'X-WP-Nonce': L.restNonce || '',
          },
        })
        .then(function (res) {
          return res.json();
        })
        .then(function () {
          patch({ [META_DETACHED]: '' });
          if (wp.data.dispatch('core/editor')?.editPost && masterRecord) {
            // Reload meta; full content refresh via editor reload.
            window.location.reload();
          } else {
            window.location.reload();
          }
        })
        .catch(function () {
          setReverting(false);
        });
    }

    const recurrenceBlock = isOccurrence
      ? el(
          'div',
          { className: 'bl-event-recurring' },
          el('h3', { className: 'bl-event-recurring__heading' }, L.recurringTitle || 'Recurring'),
          el('p', null, L.partOfRecurring || 'Part of a recurring event.'),
          masterId
            ? el(
                Fragment,
                null,
                el('p', { className: 'bl-event-recurring__master-label' }, L.masterLabel || 'Master:'),
                el(
                  'p',
                  { className: 'bl-event-recurring__master-title' },
                  masterEditUrl ? el('a', { href: masterEditUrl }, masterTitle || '#' + masterId) : masterTitle || '#' + masterId,
                ),
              )
            : null,
          (function () {
            const masterRule = masterRecord && masterRecord.meta ? parseRule(masterRecord.meta[META_RECURRENCE] || '') : null;
            const lines = summaryLines(masterRule);
            if (!lines.length) {
              return el('p', { className: 'description' }, L.notRepeating || 'Not repeating');
            }
            return el(
              Fragment,
              null,
              lines.map(function (line, i) {
                return el('p', { key: 'mline-' + i, className: 'bl-event-recurring__line' }, line);
              }),
            );
          })(),
          detached
            ? el(
                'div',
                { className: 'bl-event-recurring__detached notice notice-warning inline' },
                el('p', null, el('strong', null, L.customContentTitle || 'This occurrence has custom content.')),
                el('p', null, L.customContentHelp || 'It will not update when the master event changes.'),
                el(
                  Button,
                  {
                    variant: 'secondary',
                    isBusy: reverting,
                    disabled: reverting,
                    onClick: revertToMaster,
                  },
                  L.revertToMaster || 'Revert to master',
                ),
              )
            : null,
          masterEditUrl
            ? el(
                Button,
                {
                  variant: 'secondary',
                  className: 'bl-event-recurring__edit-master',
                  href: masterEditUrl,
                },
                L.editInMaster || 'Edit in master event',
              )
            : null,
        )
      : el(
          'div',
          { className: 'bl-event-recurring' },
          el('h3', { className: 'bl-event-recurring__heading' }, L.recurringTitle || 'Recurring'),
          rule
            ? summaryLines(rule).map(function (line, i) {
                return el('p', { key: 'line-' + i, className: 'bl-event-recurring__line' }, line);
              })
            : el('p', { className: 'description' }, L.notRepeating || 'Not repeating'),
          !hasStartDate
            ? el('p', { className: 'description bl-event-recurring__needs-date' }, L.recurrenceNeedsDate || 'Set a start date to create occurrence posts.')
            : null,
          rule && hasStartDate && occurrenceCount != null
            ? el(
                'p',
                { className: 'bl-event-recurring__count' },
                occurrenceCount === 1
                  ? (L.occurrenceLabel || '%d occurrence').replace('%d', '1')
                  : (L.occurrencesLabel || '%d occurrences').replace('%d', String(occurrenceCount)),
              )
            : null,
          el(
            Button,
            {
              variant: 'secondary',
              onClick: function () {
                setModalOpen(true);
              },
            },
            L.editRecurrence || 'Edit recurrence',
          ),
          modalOpen
            ? el(RecurrenceModal, {
                initialRule: rule || defaultRule(startDate),
                startDate: startDate,
                endDate: endDate || startDate,
                exdates: exdates,
                onRequestClose: function () {
                  setModalOpen(false);
                },
                onSave: function (encoded) {
                  const next = { [META_RECURRENCE]: encoded };
                  if (!encoded) {
                    next[META_EXDATES] = '';
                  }
                  patch(next);
                },
              })
            : null,
        );

    return el(
      PluginDocumentSettingPanel,
      {
        name: 'baselayer-event',
        title: L.panelTitle || 'Event',
        className: 'baselayer-event-panel',
      },
      el(
        'div',
        { className: 'baselayer-editor-panel' },
        el(
          PanelRow,
          null,
          el('label', { className: 'components-base-control__label', htmlFor: 'bl-event-start-date' }, L.startDateLabel || 'Start date'),
          el('input', {
            id: 'bl-event-start-date',
            type: 'date',
            className: 'components-text-control__input bl-event-date-input bl-event-date-input--start',
            value: startDate,
            disabled: dateFieldsDisabled,
            onChange: function (e) {
              var v = e.target.value;
              patch({
                [META_START_DATE]: v,
                [META_END_DATE]: endDate && endDate >= v ? endDate : v,
              });
            },
          }),
        ),
        el(
          PanelRow,
          null,
          el('label', { className: 'components-base-control__label', htmlFor: 'bl-event-end-date' }, L.endDateLabel || 'End date'),
          el('input', {
            id: 'bl-event-end-date',
            type: 'date',
            className: 'components-text-control__input bl-event-date-input bl-event-date-input--end',
            value: endDate || startDate,
            min: startDate || undefined,
            disabled: dateFieldsDisabled,
            onChange: function (e) {
              patch({ [META_END_DATE]: e.target.value });
            },
          }),
        ),
        el(
          PanelRow,
          { className: 'bl-event-include-times' },
          el(ToggleControl, {
            key: 'toggle',
            className: 'bl-event-include-times__control',
            label: L.includeTimesLabel || 'Include times',
            checked: timesEnabled,
            disabled: dateFieldsDisabled,
            onChange: function (on) {
              onToggleTimes(on);
            },
          }),
        ),
        timesEnabled
          ? el(
              PanelRow,
              { key: 'bl-event-start-time-row' },
              el('label', { className: 'components-base-control__label', htmlFor: 'bl-event-start-time' }, L.startTimeLabel || 'Start time'),
              el('input', {
                id: 'bl-event-start-time',
                type: 'time',
                className: 'components-text-control__input bl-event-time-input bl-event-time-input--start',
                value: startTime,
                disabled: dateFieldsDisabled,
                onChange: function (e) {
                  patch({ [META_START_TIME]: e.target.value });
                },
              }),
            )
          : null,
        timesEnabled
          ? el(
              PanelRow,
              { key: 'bl-event-end-time-row' },
              el('label', { className: 'components-base-control__label', htmlFor: 'bl-event-end-time' }, L.endTimeLabel || 'End time'),
              el('input', {
                id: 'bl-event-end-time',
                type: 'time',
                className: 'components-text-control__input bl-event-time-input bl-event-time-input--end',
                value: endTime,
                disabled: dateFieldsDisabled,
                onChange: function (e) {
                  patch({ [META_END_TIME]: e.target.value });
                },
              }),
            )
          : null,
        showStatus
          ? el(
              'div',
              { key: 'bl-event-status', className: 'bl-event-status' },
              el(SelectControl, {
                label: L.statusLabel || 'Status',
                value: statusKey || 'active',
                options: statusOptions.length
                  ? statusOptions
                  : [
                      { label: 'None', value: 'active' },
                      { label: 'Cancelled', value: 'cancelled' },
                      { label: 'Postponed', value: 'postponed' },
                      { label: '────────', value: '__sep__', disabled: true },
                      { label: 'Custom', value: 'custom' },
                    ],
                onChange: function (value) {
                  if (value === '__sep__') {
                    return;
                  }
                  const next = { [META_STATUS]: value || 'active' };
                  if (!value || value === 'active') {
                    next[META_STATUS_INFO] = '';
                  }
                  patch(next);
                },
              }),
              statusKey === 'custom'
                ? el(TextControl, {
                    label: L.statusCustomLabel || 'Status label',
                    value: statusCustomLabel,
                    onChange: function (v) {
                      patch({ [META_STATUS_LABEL]: v });
                    },
                  })
                : null,
              statusKey === 'custom' && statusColorOptions.length
                ? el(
                    'div',
                    { key: 'bl-event-status-color', className: 'bl-event-status-color' },
                    el(SelectControl, {
                      label: L.statusColorLabel || 'Color',
                      value: statusColorToken,
                      options: statusColorOptions,
                      onChange: function (value) {
                        patch({ [META_STATUS_COLOR]: value || statusColorDefault });
                      },
                    }),
                    el('span', {
                      className: 'bl-event-status-color__swatch',
                      style: { backgroundColor: statusColorHex },
                      title: statusColorHex,
                      'aria-hidden': true,
                    }),
                  )
                : null,
              statusKey && statusKey !== 'active'
                ? TextareaControl
                  ? el(TextareaControl, {
                      label: L.statusInfoLabel || 'Status information',
                      value: statusInfo,
                      rows: 3,
                      onChange: function (v) {
                        patch({ [META_STATUS_INFO]: v });
                      },
                    })
                  : el(
                      PanelRow,
                      null,
                      el(
                        'label',
                        { className: 'components-base-control__label' },
                        L.statusInfoLabel || 'Status information',
                      ),
                      el('textarea', {
                        className: 'components-textarea-control__input',
                        rows: 3,
                        value: statusInfo,
                        onChange: function (e) {
                          patch({ [META_STATUS_INFO]: e.target.value });
                        },
                      }),
                    )
                : null,
            )
          : null,
        recurrenceBlock,
      ),
    );
  }

  function EventPanel() {
    return el(EventPanelContent, null);
  }

  if (PluginDocumentSettingPanel) {
    registerPlugin('baselayer-event', {
      render: EventPanel,
    });
  }
})();
