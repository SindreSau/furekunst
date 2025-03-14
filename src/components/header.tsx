// components/header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Page {
    title: string;
    url: string;
}

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const pages: Page[] = [
        { title: 'Heim', url: '/' },
        { title: 'Galleri', url: '/galleri' },
        { title: 'Kontakt', url: '/kontakt' },
    ];

    const groupPath = '/' + pathname.split('/')[1];

    const toggleMenu = (): void => {
        setIsMenuOpen(!isMenuOpen);
        document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
        document.body.style.height = !isMenuOpen ? '100vh' : '';
    };

    useEffect(() => {
        const handleResize = (): void => {
            if (window.innerWidth >= 768 && isMenuOpen) {
                setIsMenuOpen(false);
                document.body.style.overflow = '';
                document.body.style.height = '';
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMenuOpen]);

    return (
        <header className='z-50 w-full'>
            <div className='container max-w-6xl mx-auto  py-2'>
                {/* Skip to main content */}
                <a href='#innhold' className='sr-only focus:not-sr-only'>
                    Hopp til hovedinnhold
                </a>
                <div className='flex justify-between items-center py-4'>
                    {/* Logo */}
                    <Link href='/' className='text-xl text-gray-800 font-didot tracking-widest'>
                        ELISABETH FURE
                    </Link>

                    {/* Mobile menu button */}
                    <button
                        onClick={toggleMenu}
                        className='md:hidden px-2 text-gray-600 hover:text-gray-900 focus:outline-none z-50 relative cursor-pointer'>
                        <span className='sr-only'>Open main menu</span>
                        <div className='w-6 h-6 relative'>
                            <span
                                className={`absolute top-0 left-0 w-6 h-0.5 bg-current transform transition duration-300 ease-in-out ${
                                    isMenuOpen ? 'rotate-45 translate-y-2.5' : ''
                                }`}></span>
                            <span
                                className={`absolute top-2.5 left-0 w-6 h-0.5 bg-current transform transition duration-300 ease-in-out ${
                                    isMenuOpen ? 'opacity-0' : ''
                                }`}></span>
                            <span
                                className={`absolute bottom-0 left-0 w-6 h-0.5 bg-current transform transition duration-300 ease-in-out ${
                                    isMenuOpen ? '-rotate-45 -translate-y-3' : ''
                                }`}></span>
                        </div>
                    </button>

                    {/* Desktop menu */}
                    <nav className='hidden md:flex space-x-4'>
                        {pages.map((page) => (
                            <Link
                                key={page.url}
                                href={page.url}
                                className={`hover:text-gray-900 ${
                                    groupPath === page.url ? 'text-gray-900 border-b-2' : 'text-gray-600'
                                }`}
                                aria-current={pathname === page.url ? 'page' : undefined}>
                                {page.title}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Gray divider - container width instead of full width */}
                <div className='h-px bg-gray-300 w-full'></div>
            </div>

            {/* Mobile menu */}
            <nav
                className={`fixed left-0 right-0 top-[64px] pt-6 bottom-0 bg-pastel-dark z-40 transform ${
                    isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                } transition-transform duration-300 ease-in-out md:hidden overflow-y-auto`}>
                <div className='flex flex-col h-full justify-start items-center space-y-8 text-2xl pt-8 shadow-md'>
                    {pages.map((page, index) => (
                        <div
                            key={page.url}
                            className={`transition-all duration-500 ease-out ${
                                isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}
                            style={{ transitionDelay: isMenuOpen ? `${index * 150}ms` : '0ms' }}>
                            <Link
                                href={page.url}
                                className={`text-gray-600 hover:text-gray-800 ${
                                    groupPath === page.url
                                        ? 'text-gray-800 text-[1.58rem] border-gray-200 border-b-2'
                                        : ''
                                }`}
                                aria-current={pathname === page.url ? 'page' : undefined}
                                onClick={() => setIsMenuOpen(false)}>
                                {page.title}
                            </Link>
                        </div>
                    ))}
                </div>
            </nav>
        </header>
    );
};

export default Header;
