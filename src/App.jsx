import { NavBar, Welcome, Footer, Service, Transactions } from './components';

const App = () => {
  return (
    <div className='min-h-screen'>
      <div className='gradient-bg-welcome'>
        <NavBar />
        <Welcome />
      </div>
      <Service />
      <Transactions />
    </div>
  );
}

export default App;
