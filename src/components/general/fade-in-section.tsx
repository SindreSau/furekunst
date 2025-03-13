// src/components/general/fade-in-section.tsx
'use client';
import { useEffect, useRef, useState, ReactNode } from 'react';

interface FadeInSectionProps {
    children: ReactNode;
    delay?: number;
    className?: string;
    observeScroll?: boolean; // Control whether to use the IntersectionObserver
}

export const FadeInSection = ({
    children,
    delay = 0,
    className = '',
    observeScroll = true, // Default to using scroll observation
}: FadeInSectionProps) => {
    // Start as not visible regardless of observeScroll setting
    const [isVisible, setVisible] = useState<boolean>(false);
    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // If we're not observing scroll, set visible after a minimal timeout
        // to ensure the initial "hidden" state is applied first
        if (!observeScroll) {
            const timer = setTimeout(() => {
                setVisible(true);
            }, 10); // Small delay to ensure component mounts with hidden state first
            return () => clearTimeout(timer);
        } else if (domRef.current) {
            // Normal intersection observer behavior
            const currentRef = domRef.current;
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    setVisible(true);
                    observer.unobserve(currentRef);
                }
            });
            observer.observe(currentRef);
            return () => {
                if (currentRef) {
                    observer.unobserve(currentRef);
                }
            };
        }
    }, [observeScroll]);

    return (
        <div
            ref={domRef}
            className={`${className} transition-all duration-500 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
};
