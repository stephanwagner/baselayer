/**
 * Undo / redo with explicit before-mutation snapshots.
 *
 * @param {object} options
 * @param {() => unknown} options.getSnapshot
 * @param {(snapshot: unknown) => void} options.applySnapshot
 * @param {number} [options.limit=50]
 */
export function createHistory({ getSnapshot, applySnapshot, limit = 50 }) {
  const undoStack = [];
  const redoStack = [];
  let applying = false;
  let pending = null;

  const clone = (value) => {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (e) {
      return value;
    }
  };

  return {
    /** Capture state before a mutation (add, drag, replace). */
    recordBefore() {
      if (applying) return;
      pending = clone(getSnapshot());
    },
    /** After a mutation, push the pending before-state onto the undo stack. */
    commit() {
      if (applying || pending == null) return;
      undoStack.push(pending);
      if (undoStack.length > limit) {
        undoStack.shift();
      }
      redoStack.length = 0;
      pending = null;
    },
    canUndo() {
      return undoStack.length > 0 || pending != null;
    },
    canRedo() {
      return redoStack.length > 0;
    },
    undo() {
      if (pending != null) {
        this.commit();
      }
      if (!undoStack.length) return false;
      applying = true;
      redoStack.push(clone(getSnapshot()));
      applySnapshot(undoStack.pop());
      applying = false;
      return true;
    },
    redo() {
      if (!redoStack.length) return false;
      applying = true;
      undoStack.push(clone(getSnapshot()));
      applySnapshot(redoStack.pop());
      applying = false;
      return true;
    },
    clear() {
      undoStack.length = 0;
      redoStack.length = 0;
      pending = null;
    },
    get isApplying() {
      return applying;
    },
  };
}
