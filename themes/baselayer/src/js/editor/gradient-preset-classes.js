/**
 * WP 7.1+: restore has-{slug}-gradient-background in the editor canvas.
 *
 * Core's background.gradient support only emits has-background + inline
 * background-image. Front-end restore lives in includes/blocks.php; this
 * filter mirrors that for BlockListBlock (editor-only, not saved HTML).
 */
const { addFilter } = wp.hooks;
const { createHigherOrderComponent } = wp.compose;
const { createElement } = wp.element;

const PRESET_PREFIX = 'var:preset|gradient|';

const withGradientPresetClass = createHigherOrderComponent((BlockListBlock) => {
	return (props) => {
		const gradient = props.attributes?.style?.background?.gradient;
		if (typeof gradient !== 'string' || !gradient.startsWith(PRESET_PREFIX)) {
			return createElement(BlockListBlock, props);
		}

		const slug = gradient.slice(PRESET_PREFIX.length);
		if (!slug) {
			return createElement(BlockListBlock, props);
		}

		return createElement(BlockListBlock, {
			...props,
			className: `has-${slug}-gradient-background`,
		});
	};
}, 'withGradientPresetClass');

addFilter('editor.BlockListBlock', 'baselayer/gradient-preset-classes', withGradientPresetClass);
