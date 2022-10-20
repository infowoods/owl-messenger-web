export const isProduct = process.env.APP_ENV === 'prod'

export const APPS = {
  current: 'owl',
  owl: {
    name: 'owl',
    title: 'owl_title',
    description: 'owl_description',
    id: '60d30faa-3825-48da-ac1c-6aca1f573dd5',
    url: 'https://owl.infowoods.com/',
    icon: '/images/icon-owl.png',
  },
  oak: {
    name: 'oak',
    title: 'oak_title',
    description: 'oak_description',
    id: '22ec662a-e3b9-442c-bf6a-8aec0ea08b61',
    url: 'https://oak.infowoods.com/',
    icon: '/images/icon-oak.png',
  },
}
