import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Note } from '../types/index.js';

export interface WikiLinkSuggestionOptions {
  notes: Note[];
  onSelect: (noteTitle: string) => void;
  render: () => {
    onStart: (props: SuggestionProps) => void;
    onUpdate: (props: SuggestionProps) => void;
    onExit: () => void;
    onKeyDown: (props: { event: KeyboardEvent }) => boolean;
  };
}

export interface SuggestionProps {
  query: string;
  suggestions: Note[];
  range: { from: number; to: number };
  decorationNode: HTMLElement | null;
}

const pluginKey = new PluginKey('wikiLinkSuggestion');

export const WikiLinkSuggestion = Extension.create<WikiLinkSuggestionOptions>({
  name: 'wikiLinkSuggestion',

  addOptions() {
    return {
      notes: [],
      onSelect: () => {},
      render: () => ({
        onStart: () => {},
        onUpdate: () => {},
        onExit: () => {},
        onKeyDown: () => false,
      }),
    };
  },

  addProseMirrorPlugins() {
    const options = this.options;
    const render = options.render();

    return [
      new Plugin({
        key: pluginKey,

        state: {
          init() {
            return {
              active: false,
              range: { from: 0, to: 0 },
              query: '',
            };
          },

          apply(_tr, value, _oldState, newState) {
            const { selection } = newState;
            const { empty } = selection;

            // Only proceed if cursor is active (not selecting)
            if (!empty) {
              if (value.active) {
                render.onExit();
              }
              return { active: false, range: { from: 0, to: 0 }, query: '' };
            }

            // Get text before cursor
            const $from = selection.$from;
            const textBefore = $from.parent.textBetween(
              Math.max(0, $from.parentOffset - 50),
              $from.parentOffset,
              undefined,
              '\ufffc'
            );

            // Check for [[ trigger
            const match = textBefore.match(/\[\[([^\]]*)?$/);

            if (match) {
              const query = match[1] || '';
              const from = $from.pos - match[0].length + 2; // +2 to skip [[
              const to = $from.pos;

              // Filter notes by query
              const suggestions = options.notes.filter(note =>
                note.title.toLowerCase().includes(query.toLowerCase())
              );

              const newValue = {
                active: true,
                range: { from, to },
                query,
                suggestions,
              };

              // Trigger appropriate callback
              if (!value.active) {
                render.onStart({ ...newValue, decorationNode: null });
              } else {
                render.onUpdate({ ...newValue, decorationNode: null });
              }

              return newValue;
            }

            // Exit if was active
            if (value.active) {
              render.onExit();
            }

            return { active: false, range: { from: 0, to: 0 }, query: '' };
          },
        },

        props: {
          handleKeyDown(view, event) {
            const state = pluginKey.getState(view.state);

            if (state?.active) {
              return render.onKeyDown({ event });
            }

            return false;
          },

          // Add decoration to show the trigger
          decorations(state) {
            const pluginState = pluginKey.getState(state);

            if (pluginState?.active) {
              return DecorationSet.create(state.doc, [
                Decoration.inline(
                  pluginState.range.from - 2,
                  pluginState.range.to,
                  {
                    class: 'wiki-link-suggestion-trigger',
                  }
                ),
              ]);
            }

            return DecorationSet.empty;
          },
        },
      }),
    ];
  },
});
