import { Routes, Route } from 'react-router';
import AppAdmin from './routes/AppAdmin';
import AppUser from './routes/AppUser';
import AppLogin from './routes/AppLogin';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLogin />} />
      <Route path="/admin/*" element={<AppAdmin />} />
      <Route path="/user/*" element={<AppUser />} />
    </Routes>
  );
}

export default App;