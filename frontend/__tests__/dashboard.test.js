import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../src/pages/Dashboard';

describe('Dashboard Page', () => {
    test('should render dashboard heading and recent activities', () => {
        render(<Dashboard />);

        // Check the main heading
        const heading = screen.getByText(/dashboard/i);
        expect(heading).toBeInTheDocument();

        // Check the welcome paragraph
        const welcomeMessage = screen.getByText(/welcome back! here's a quick overview/i);
        expect(welcomeMessage).toBeInTheDocument();

        // Check for one of the activity items
        const activityTitle = screen.getByText(/updated project/i);
        const activityDesc = screen.getByText(/your "awesome-project" was updated/i);

        expect(activityTitle).toBeInTheDocument();
        expect(activityDesc).toBeInTheDocument();
    });
});
