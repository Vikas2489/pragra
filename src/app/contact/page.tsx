import Header from '../components/Header';

const Contact: React.FC = () => {
  return (
    <>
      <Header />{' '}
      <div className="flex items-center justify-center sm:mx-0 sm:my-auto min-h-screen">
        <h1 className="font-bold text-xl text-blue-700">
          This is a contact us page
        </h1>
      </div>
    </>
  );
};

export default Contact;
