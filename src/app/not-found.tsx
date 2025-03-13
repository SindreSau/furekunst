import FrameButton from '@/components/frame-button';
import Link from 'next/link';

const NotFoundPage = () => {
    return (
        <div className='flex flex-col items-center justify-center h-full '>
            <h1 className='text-9xl font-bold mb-4'>404</h1>
            <h2 className='text-2xl font-semibold mb-2'>Oisann!</h2>
            <p className='text-gray-600 mb-8 max-w-md'>Det ser ut til at du har gått deg vill.</p>
            <FrameButton type='link' href='/' className='text-lg'>
                Gå hjem
            </FrameButton>
        </div>
    );
};

export default NotFoundPage;
