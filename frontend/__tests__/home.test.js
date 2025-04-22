import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import { Provider } from 'react-redux'; // Import Provider from react-redux
import { createStore } from 'redux'; // For creating a mock store
import Home from '../src/pages/Home';  // The Home page component we're testing

// A simple mock reducer for the Redux store
const mockReducer = (state = { user: { githubProfile: 'user123' } }, action) => {
    return state;
};

// Create a mock store using the mockReducer
const mockStore = createStore(mockReducer);

describe('Home Page', () => {
    // Helper to render with both BrowserRouter and Redux Provider
    const renderWithRouterAndRedux = (ui) => {
        return render(
            <Provider store={mockStore}> {/* Wrap with Provider */}
                <BrowserRouter> {/* Wrap with BrowserRouter */}
                    {ui}
                </BrowserRouter>
            </Provider>
        );
    };

    test('should display the "New Deployment" heading', () => {
        renderWithRouterAndRedux(<Home />);

        const heading = screen.getByText(/new deployment/i);  // Look for the text in h2
        expect(heading).toBeInTheDocument();  // Assert that it's in the document
    });
});
