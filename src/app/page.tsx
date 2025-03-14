// app/page.tsx
'use client';

import { FadeInSection } from '@/components/general/fade-in-section';

import Image from 'next/image';
import FrameButton from '@/components/frame-button';
import ImageCarousel from '@/components/image-carousel';

export default function Home() {
    const lazydogs = '/lazy-dogs.jpg';
    const hjort = '/hjort.jpeg';
    const sjimpanse = '/sjimpanse.jpeg';
    const labrador = '/labrador.jpeg';
    const profilbilde = '/profilbilde.jpeg';

    const carouselImages = [hjort, sjimpanse, labrador];

    return (
        <>
            <FadeInSection>
                <div className='relative md:mb-12 mb-8'>
                    <Image
                        src={lazydogs}
                        alt='Bilde: Lazy dogs'
                        width={1754}
                        height={1241}
                        quality={100}
                        priority
                        className='w-full h-full object-cover'
                        id='heroImage'
                    />
                </div>
            </FadeInSection>

            {/* Top separator */}
            <FadeInSection delay={75}>
                <div className='w-full h-px bg-gray-300 md:mb-12 mb-6'></div>
            </FadeInSection>

            <section className='flex md:items-start items-center md:gap-0  gap-5 flex-col-reverse md:flex-row mb-12'>
                <FadeInSection delay={150} className='md:w-1/3'>
                    <div className='overflow-hidden'>
                        <Image
                            src={profilbilde}
                            alt='Elisabeth Fure Schwarz'
                            width={2316}
                            height={3088}
                            sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px'
                            quality={65}
                            className='h-full max-w-[50vw] md:max-w-none rounded-sm sm:rounded-none w-full object-cover frame-shadow'
                            priority
                        />
                    </div>
                </FadeInSection>

                <FadeInSection delay={100}>
                    <div className='hidden md:block h-auto w-px bg-gray-300 mx-4 self-stretch my-auto'></div>
                </FadeInSection>

                <div className='flex flex-col md:w-2/3'>
                    <FadeInSection delay={100}>
                        <h1 className='mb-6 font-didot'>Om Kunstnaren</h1>
                    </FadeInSection>
                    <FadeInSection delay={200}>
                        <div className='flex flex-col gap-4 tracking-wider text-gray-700'>
                            <p>
                                Hei og hå! Mitt namn er Elisabeth Fure Schwarz, og det er eg som står bak
                                enkeltpersonforetaket Fure.kunst.
                            </p>

                            <p>
                                Frå 2019-2021 gjekk eg på Einar Granum Kunstfagskule, der eg andre året hadde
                                fordjupning i maleri og billedkunst. Sidan då har eg solgt både originalar og print av
                                det eg har laga, mest gjennom marknadsføring på instagramkontoen min Fure.kunst.
                            </p>

                            <p>
                                Mitt favorittmedium å male med er akvarell, men det går også mykje i akryl og litt i
                                olje. Elles finn du fleire tegningar laga med tusj og penn.
                            </p>

                            <p>
                                Ta gjerne kontakt om du skulle vere interessert i noko av det du finn her på nettsida,
                                eller om du har ønske om å bestille eit personleg bilete.
                            </p>
                        </div>
                    </FadeInSection>
                </div>
            </section>

            {/* Bottom separator */}
            <FadeInSection delay={75}>
                <div className='w-full h-px bg-gray-300 mb-6'></div>
            </FadeInSection>

            <section className='py-6'>
                <FadeInSection delay={100}>
                    <h1 className='text-center mb-8 font-didot'>Nokre utvalgte bilete</h1>
                </FadeInSection>

                {/* Carousel for small screens */}
                <FadeInSection delay={200} className='md:hidden'>
                    <div className='px-1 md:px-0'>
                        <ImageCarousel images={carouselImages} />
                    </div>
                </FadeInSection>

                {/* Grid for larger screens */}
                <div className='hidden md:grid sm:grid-cols-3 gap-8'>
                    {carouselImages.map((img, index) => (
                        <FadeInSection key={index} delay={200 + index * 100}>
                            <div className='aspect-auto overflow-hidden h-full'>
                                <Image
                                    src={img}
                                    alt={`Image ${index + 1}`}
                                    width={370}
                                    height={370}
                                    className='w-full h-full object-cover frame-shadow'
                                    loading='lazy'
                                />
                            </div>
                        </FadeInSection>
                    ))}
                </div>

                {/* Link to gallery (button) */}
                <FadeInSection delay={50}>
                    <div className='flex justify-center gap-12 mt-12'>
                        <FrameButton type='link' href='/galleri' rightArrow={false}>
                            Galleri
                        </FrameButton>
                        <FrameButton type='link' href='/kontakt' rightArrow={false}>
                            Ta kontakt
                        </FrameButton>
                    </div>
                </FadeInSection>
            </section>
        </>
    );
}
