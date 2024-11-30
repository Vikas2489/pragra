import Image from 'next/image';
import Header from './components/Header';

export default function Home() {
  return (
    <>
      <Header />{' '}
      <div className="flex items-center justify-center sm:mx-0 sm:my-auto min-h-screen">
        <h1 className="font-bold text-xl text-red-700">This is a home page</h1>
      </div>
    </>
  );
}
