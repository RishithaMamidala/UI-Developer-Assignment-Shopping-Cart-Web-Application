import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/app/store.js';
import Spinner from '@/components/ui/Spinner/Spinner.jsx';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<Spinner size="lg" />} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);
