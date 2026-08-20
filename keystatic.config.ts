import { config, fields, collection } from '@keystatic/core'

export default config({
  storage:
    process.env.NODE_ENV === 'production' && process.env.PUBLIC_KEYSTATIC_REPO
      ? {
          kind: 'github',
          repo:
            (process.env.PUBLIC_KEYSTATIC_REPO as `${string}/${string}`) ||
            'SindreSau/furekunst',
        }
      : {
          kind: 'local',
        },
  collections: {
    gallery: collection({
      label: 'Galleri (Kunstverk)',
      slugField: 'title',
      path: 'src/content/gallery/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Tittel' } }),
        description: fields.text({
          label: 'Beskriving (Medium/Teknikk)',
          multiline: true,
        }),
        type: fields.select({
          label: 'Type',
          options: [
            { label: 'Original', value: 'original' },
            { label: 'Print', value: 'print' },
          ],
          defaultValue: 'original',
        }),
        passepartout: fields.checkbox({
          label: 'Passepartout (ramme)',
          defaultValue: true,
        }),
        size: fields.text({
          label: 'Storleik på original (valfritt, t.d. 30x40cm)',
        }),
        price: fields.integer({
          label: 'Enkeltpris / originalpris (valfritt)',
          validation: { min: 0 },
        }),
        sizeAndPrice: fields.array(
          fields.object({
            size: fields.text({
              label: 'Størrelse (t.d. Print A3 (29,7x42cm))',
            }),
            price: fields.integer({
              label: 'Pris (kr)',
              validation: { min: 0 },
            }),
          }),
          {
            label: 'Størrelsar og prisar',
            itemLabel: props =>
              `${props.fields.size.value || 'Ny storleik'} — kr ${props.fields.price.value || 0},-`,
          },
        ),
        image: fields.image({
          label: 'Bilete av kunstverk',
          directory: 'src/assets/artworks',
          publicPath: '../../assets/artworks/',
        }),
      },
    }),
  },
})
