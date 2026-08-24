import { config, fields, collection, singleton } from '@keystatic/core'

export default config({
  storage: import.meta.env.PROD
    ? {
        kind: 'github',
        repo: 'SindreSau/furekunst',
      }
    : {
        kind: 'local',
      },
  ui: {
    brand: { name: 'Furekunst Admin' },
    navigation: {
      'Sider og innhald': ['home', 'contact', 'gallery'],
      Innstillingar: ['settings', 'seo'],
    },
  },
  collections: {
    gallery: collection({
      label: 'Kunstverk (Galleri)',
      slugField: 'title',
      path: 'src/content/gallery/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Tittel på kunstverket' } }),
        published: fields.checkbox({
          label: 'Publisert (vis kunstverket i galleriet)',
          description:
            'Slå av for å skjule kunstverket frå galleriet utan å slette det.',
          defaultValue: true,
        }),
        description: fields.text({
          label: 'Beskriving (Medium/Teknikk, t.d. "Akvarell på papir")',
          multiline: true,
        }),
        type: fields.conditional(
          fields.select({
            label: 'Type kunstverk',
            options: [
              { label: 'Original', value: 'original' },
              { label: 'Print', value: 'print' },
            ],
            defaultValue: 'original',
          }),
          {
            original: fields.object({
              size: fields.text({
                label: 'Storleik på original (valfritt, t.d. 30x40cm)',
              }),
              price: fields.integer({
                label: 'Originalpris i kr (valfritt)',
                validation: { min: 0 },
              }),
            }),
            print: fields.object({
              sizeAndPrice: fields.array(
                fields.object({
                  size: fields.text({
                    label: 'Størrelse (t.d. Print A3 (29,7x42cm))',
                  }),
                  price: fields.integer({
                    label: 'Pris i kr',
                    validation: { min: 0 },
                  }),
                }),
                {
                  label: 'Størrelsar og prisar for print/plakat',
                  itemLabel: props =>
                    `${props.fields.size.value || 'Ny storleik'} — kr ${props.fields.price.value || 0},-`,
                },
              ),
            }),
          },
        ),
        passepartout: fields.checkbox({
          label: 'Passepartout (vis kvit inner-ramme rundt biletet)',
          defaultValue: true,
        }),
        image: fields.image({
          label: 'Bilete av kunstverket',
          directory: 'src/assets/artworks',
          publicPath: '../../assets/artworks/',
        }),
      },
    }),
  },
  singletons: {
    home: singleton({
      label: 'Framsida (Hovudside)',
      path: 'src/content/home/index',
      format: { data: 'json' },
      schema: {
        heroDesktopImage: fields.image({
          label: 'Hovudbilete Desktop (stort topp-bilete på datamaskin)',
          directory: 'src/assets/img',
          publicPath: '../../assets/img/',
        }),
        heroDesktopAlt: fields.text({
          label: 'Alt-tekst for hovudbilete Desktop',
          defaultValue: 'Bilde: Lazy dogs',
        }),
        heroMobileImage: fields.image({
          label: 'Hovudbilete Mobil (høgreist/vertikalt topp-bilete på mobil)',
          directory: 'src/assets/img',
          publicPath: '../../assets/img/',
        }),
        heroMobileAlt: fields.text({
          label: 'Alt-tekst for hovudbilete Mobil',
          defaultValue: 'Bilde: Mas',
        }),
        aboutHeading: fields.text({
          label: 'Overskrift for Om Kunstnaren',
          defaultValue: 'Om Kunstnaren',
        }),
        aboutImage: fields.image({
          label: 'Profilbilete av kunstnaren',
          directory: 'src/assets/img',
          publicPath: '../../assets/img/',
        }),
        aboutImageAlt: fields.text({
          label: 'Alt-tekst for profilbilete',
          defaultValue: 'Portrett av Elisabeth Fure Schwarz',
        }),
        aboutText: fields.mdx.inline({
          label:
            'Tekst om kunstnaren (med feit skrift, kursiv, lenkjer og linjeskift)',
          options: {
            bold: true,
            italic: true,
            link: true,
          },
        }),
        featuredHeading: fields.text({
          label: 'Overskrift for utvalgte kunstverk',
          defaultValue: 'Nokre utvalgte bilete',
        }),
        featuredItems: fields.array(
          fields.object({
            image: fields.image({
              label: 'Bilete',
              directory: 'src/assets/img',
              publicPath: '../../assets/img/',
            }),
            alt: fields.text({
              label: 'Beskrivande tekst / tittel (t.d. "Bilde: Hjort")',
            }),
          }),
          {
            label:
              'Utvalgte kunstverk på framsida (karusell på mobil, rutenett på desktop)',
            itemLabel: props => props.fields.alt.value || 'Utvalgt bilete',
          },
        ),
        galleryButtonText: fields.text({
          label: 'Tekst på Galleri-knapp',
          defaultValue: 'Galleri',
        }),
        contactButtonText: fields.text({
          label: 'Tekst på Kontakt-knapp',
          defaultValue: 'Ta kontakt',
        }),
      },
    }),
    contact: singleton({
      label: 'Kontaktsida',
      path: 'src/content/contact/index',
      format: { data: 'json' },
      schema: {
        heading: fields.text({
          label: 'Overskrift på kontaktsida',
          defaultValue: 'Kontakt',
        }),
        image: fields.image({
          label: 'Profilbilete på kontaktsida',
          directory: 'src/assets/img',
          publicPath: '../../assets/img/',
        }),
        imageAlt: fields.text({
          label: 'Alt-tekst for profilbilete',
          defaultValue: 'Elisabeth Fure Schwarz',
        }),
        introText: fields.mdx.inline({
          label:
            'Kontakttekst (med feit skrift, kursiv, lenkjer og linjeskift)',
          options: {
            bold: true,
            italic: true,
            link: true,
          },
        }),
      },
    }),
    settings: singleton({
      label: 'Kontaktinformasjon og sosiale lenker',
      path: 'src/content/settings/index',
      format: { data: 'json' },
      schema: {
        artistName: fields.text({
          label: 'Kunstnarens namn',
          defaultValue: 'Elisabeth Fure Schwarz',
        }),
        email: fields.text({
          label: 'E-postadresse for førespurnader',
          defaultValue: 'fure.kunst@gmail.com',
        }),
        instagramUrl: fields.text({
          label: 'Instagram URL',
          defaultValue: 'https://www.instagram.com/fure.kunst',
        }),
        instagramHandle: fields.text({
          label: 'Instagram visningsnamn (t.d. fure.kunst)',
          defaultValue: 'fure.kunst',
        }),
        facebookUrl: fields.text({
          label: 'Facebook URL',
          defaultValue: 'https://www.facebook.com/fure.kunst/',
        }),
        footerCopyright: fields.text({
          label: 'Copyright-tekst nedst på sida',
          defaultValue: 'Furekunst. Alle rettar reserverte.',
        }),
      },
    }),
    seo: singleton({
      label: 'Søkemotor og deling (SEO)',
      path: 'src/content/seo/index',
      format: { data: 'json' },
      schema: {
        defaultSiteTitle: fields.text({
          label:
            'Standard sidetittel (visast i Google og nettlesarfane dersom sida manglar eigen tittel)',
          defaultValue: 'Furekunst',
        }),
        defaultSiteDescription: fields.text({
          label:
            'Standard sidebeskriving (brukt i Google-søk og førehandsvising ved deling på sosiale medium dersom sida manglar eigen tekst)',
          multiline: true,
          defaultValue:
            'Furekunst viser kunstnar Elisabeth Fure Schwarz sine måleri og kunstverk.',
        }),
        homeSeoTitle: fields.text({
          label: 'Framsida: Tittel i Google / fane',
          defaultValue: 'Heim - Kunstnar Elisabeth Fure Schwarz | Furekunst',
        }),
        homeSeoDescription: fields.text({
          label: 'Framsida: Beskriving i Google og ved deling',
          multiline: true,
          defaultValue:
            'Elisabeth Fure Schwarz er kunstnaren bak Furekunst, med hovudfokus på akvarell. Utforsk galleriet med originale kunstverk og bestill personlege bilete.',
        }),
        gallerySeoTitle: fields.text({
          label: 'Gallerisida: Tittel i Google / fane',
          defaultValue: 'Galleri - Kunstverk til sals | Furekunst',
        }),
        gallerySeoDescription: fields.text({
          label: 'Gallerisida: Beskriving i Google og ved deling',
          multiline: true,
          defaultValue:
            'Utforsk kunstsamlinga til Elisabeth Fure Schwarz med måleri i akryl, akvarell, og olje, samt teikningar med tusj og penn.',
        }),
        contactSeoTitle: fields.text({
          label: 'Kontaktsida: Tittel i Google / fane',
          defaultValue: 'Kontakt | Furekunst',
        }),
        contactSeoDescription: fields.text({
          label: 'Kontaktsida: Beskriving i Google og ved deling',
          multiline: true,
          defaultValue:
            'Ta kontakt med Elisabeth Fure Schwarz for spørsmål om kjøp av kunst eller bestilling av personlege bilete. Furekunst tilbyr originale måleri, akvarell og print.',
        }),
      },
    }),
  },
})
