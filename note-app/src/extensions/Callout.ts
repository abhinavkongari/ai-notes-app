import { Node, mergeAttributes } from '@tiptap/core';

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (type: 'info' | 'warning' | 'success' | 'error') => ReturnType;
      toggleCallout: (type: 'info' | 'warning' | 'success' | 'error') => ReturnType;
    };
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: 'callout',

  group: 'block',

  content: 'block+',

  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: element => element.getAttribute('data-type'),
        renderHTML: attributes => {
          return {
            'data-type': attributes.type,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-callout]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const type = HTMLAttributes['data-type'] || 'info';
    
    const iconMap = {
      info: '🔵',
      warning: '⚠️',
      success: '✅',
      error: '❌',
    };

    const colorMap = {
      info: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100',
      warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-900 dark:text-yellow-100',
      success: 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-100',
      error: 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-100',
    };

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-callout': '',
        class: `callout callout-${type} border-l-4 p-4 rounded ${colorMap[type as keyof typeof colorMap]}`,
      }),
      [
        'div',
        { class: 'callout-icon text-xl inline-block mr-2' },
        iconMap[type as keyof typeof iconMap],
      ],
      ['div', { class: 'callout-content inline-block' }, 0],
    ];
  },

  addCommands() {
    return {
      setCallout:
        (type) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, { type });
        },
      toggleCallout:
        (type) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, { type });
        },
    };
  },
});

