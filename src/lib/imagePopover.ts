// src/scripts/imagePopover.ts

interface ImageData {
    imageUrl: string;
    title: string;
    imageWidth: number;
    imageHeight: number;
}

function assertNumber(value: any): number {
    if (typeof value !== 'number') {
        return Number(value);
    }
    return value;
}

export function initializePopover(imageData: {
    imageUrl: string;
    title: string;
    imageWidth: number | string;
    imageHeight: number | string;
}): void {
    const safeImageData: ImageData = {
        ...imageData,
        imageWidth: assertNumber(imageData.imageWidth),
        imageHeight: assertNumber(imageData.imageHeight),
    };

    const popover = document.getElementById('fullscreen-popover') as HTMLElement | null;
    const popoverTrigger = document.getElementById('popover-trigger') as HTMLElement | null;

    let popoverContent: string | null = null;

    function createPopoverContent(data: ImageData): string {
        const aspectRatio = data.imageHeight / data.imageWidth;
        return `
            <div class="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center ${
                aspectRatio > 1 ? 'h-full' : 'w-full'
            }">
                <button
                    id='close-popover'
                    class='absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-75 transition-colors duration-200 z-10'
                    aria-label='Close popover'>
                    &times;
                </button>
                <div
                    class='frame-shadow w-full h-full'
                    style="aspect-ratio: ${data.imageWidth} / ${data.imageHeight}; max-width: 100%; max-height: 100%;">
                    <img
                        src="${data.imageUrl}?w=1200"
                        alt="${data.title}"
                        style="max-width: 100%; max-height: 100%; object-fit: contain;"
                    />
                </div>
            </div>
        `;
    }

    function showPopover(): void {
        if (popover && window.innerWidth >= 768) {
            if (!popoverContent) {
                popoverContent = createPopoverContent(imageData);
                popover.innerHTML = popoverContent;
            }
            popover.style.display = 'flex';
            setTimeout(() => {
                popover.classList.add('active');
            }, 10);
        }
    }

    function hidePopover(): void {
        if (popover) {
            popover.classList.remove('active');
            setTimeout(() => {
                popover.style.display = 'none';
            }, 300);
        }
    }

    function handlePopoverClick(e: MouseEvent): void {
        const target = e.target as HTMLElement;
        if (target === popover || target.id === 'close-popover') {
            hidePopover();
        }
    }

    if (popoverTrigger) {
        popoverTrigger.addEventListener('click', showPopover);
    }

    if (popover) {
        popover.addEventListener('click', handlePopoverClick);
    }

    document.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            hidePopover();
        }
    });

    function handleResize(): void {
        if (window.innerWidth < 768) {
            hidePopover();
            if (popoverTrigger) popoverTrigger.style.display = 'none';
        } else {
            if (popoverTrigger) popoverTrigger.style.display = '';
        }
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on load
}
