import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Vue Lynx',
  description: 'Vue 3 integration for Lynx cross-platform framework',

  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '组件', link: '/components/view' },
      { text: 'FAQ', link: '/faq' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '核心概念', link: '/guide/core-concepts' },
            { text: '高级特性', link: '/guide/advanced' },
          ],
        },
      ],
      '/components/': [
        {
          text: '组件',
          items: [
            { text: 'View', link: '/components/view' },
            { text: 'Text', link: '/components/text' },
            { text: 'Input', link: '/components/input' },
            { text: 'List', link: '/components/list' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/lynx-vue' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Vue Lynx Contributors',
    },

    search: {
      provider: 'local',
    },
  },
})
