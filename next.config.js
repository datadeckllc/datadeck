module.exports = {
    env: {
        site: {
            title: process.env.SITE_TITLE ? process.env.SITE_TITLE : 'DataDeck',
            subTitle: process.env.SITE_SUBTITLE ? process.env.SITE_SUBTITLE : 'For Salespeople by Salespeople'
        },
        layout: {
            footer: process.env.LAYOUT_FOOTER ? process.env.LAYOUT_FOOTER : 'DataDeck, LLC ©2020'
        },
        api: {
            timeout:  process.env.API_TIMEOUT ? process.env.API_TIMEOUT : 2 * 1 * 60 * 1000 // Hr * Min * Secs * Mill
        },
        apiClient: {
            url: process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:3000/api'
        },
        services: {
            sosCa: {
                cmd: ['go', 'run'],
                goPath: 'ddpkg/sosCa/sosCa',
                outputFileName: 'SOSCA.xlsx'
            }
        }
    }
};