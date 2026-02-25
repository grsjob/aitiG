import { NavigationProvider } from './providers/NavigationProvider.tsx';
import { Provider } from 'react-redux';
import { store } from './store.ts';

function App() {
  return (
    <Provider store={store}>
      <NavigationProvider />
    </Provider>
  );
}

export default App;
