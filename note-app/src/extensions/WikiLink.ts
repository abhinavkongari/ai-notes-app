import { Mark, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface WikiLinkOptions {
  HTMLAttributes: Record<string, any>;
  onLinkClick?: (title: string) => void;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    wikiLink: {
      /**
       * Set a wiki link
       */
      setWikiLink: (title: string) => ReturnType;
      /**
       * Unset a wiki link
       */
      unsetWikiLink: () => ReturnType;
    };
  }
}

export const WikiLink = Mark.create<WikiLinkOptions>({
  name: 'wikiLink',

  priority: 1000,

  inclusive: false,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'wiki-link',
      },
      onLinkClick: undefined,
    };
  },

  addAttributes() {
    return {
      title: {
        default: null,
        parseHTML: element => element.getAttribute('data-title'),
        renderHTML: attributes => {
          if (!attributes.title) {
            return {};
          }

          return {
            'data-title': attributes.title,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-wiki-link]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-wiki-link': '',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setWikiLink:
        (title: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { title });
        },
      unsetWikiLink:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },

  addProseMirrorPlugins() {
    const { onLinkClick } = this.options;

    return [
      new Plugin({
        key: new PluginKey('wikiLinkHandler'),
        props: {
          handleClick(_view, _pos, event) {
            const target = event.target as HTMLElement;

            // Check if clicked element is a wiki link
            if (target.hasAttribute('data-wiki-link')) {
              const title = target.getAttribute('data-title');
              if (title && onLinkClick) {
                event.preventDefault();
                onLinkClick(title);
                return true;
              }
            }

            return false;
          },

          // Decorate wiki links in the document
          decorations(state) {
            const decorations: Decoration[] = [];
            const doc = state.doc;

            doc.descendants((node, pos) => {
              if (!node.isText) return;

              const text = node.text || '';
              const regex = /\[\[([^\]]+)\]\]/g;
              let match;

              while ((match = regex.exec(text)) !== null) {
                const from = pos + match.index;
                const to = from + match[0].length;
                const title = match[1].trim();

                decorations.push(
                  Decoration.inline(from, to, {
                    class: 'wiki-link-decoration',
                    'data-wiki-link': '',
                    'data-title': title,
                  })
                );
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});
