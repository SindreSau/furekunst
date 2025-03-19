import Link from 'next/link';
import React from 'react';
import { cn } from '@/lib/utils';

interface CommonProps {
    className?: string;
    rightArrow?: boolean;
    children: React.ReactNode;
}

interface ButtonProps
    extends CommonProps,
        Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {
    type: 'button';
    href?: never;
}

interface LinkProps
    extends CommonProps,
        Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'href' | 'children'> {
    type: 'link';
    href: string;
}

type FrameButtonProps = ButtonProps | LinkProps;

const FrameButton: React.FC<FrameButtonProps> = ({ type, className = '', children, rightArrow = true, ...props }) => {
    const baseStyles =
        'inline-block px-6 py-3 border-4 border-double border-gray-800 text-gray-800 font-serif font-medium md:hover:px-8 md:hover:py-3 transition-all duration-300 ease-in-out cursor-pointer ring-offset-8';

    const content = (
        <>
            {children} {rightArrow && '→'}
        </>
    );

    if (type === 'link') {
        const { href, ...linkProps } = props as LinkProps;
        return (
            <Link href={href} className={cn(baseStyles, className)} {...linkProps}>
                {content}
            </Link>
        );
    }

    return (
        <button className={cn(baseStyles, className)} {...(props as ButtonProps)}>
            {content}
        </button>
    );
};

export default FrameButton;
