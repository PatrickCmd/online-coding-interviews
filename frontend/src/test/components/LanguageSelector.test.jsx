import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LanguageSelector from '../../components/LanguageSelector';

describe('LanguageSelector', () => {
    it('should render language selector', () => {
        const mockOnChange = vi.fn();

        render(
            <LanguageSelector
                selectedLanguage="javascript"
                onLanguageChange={mockOnChange}
            />
        );

        expect(screen.getByLabelText(/Language:/i)).toBeInTheDocument();
    });

    it('should display all language options', () => {
        const mockOnChange = vi.fn();

        render(
            <LanguageSelector
                selectedLanguage="javascript"
                onLanguageChange={mockOnChange}
            />
        );

        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();

        // Check that options exist
        const options = screen.getAllByRole('option');
        expect(options.length).toBeGreaterThan(0);
    });

    it('should show selected language', () => {
        const mockOnChange = vi.fn();

        render(
            <LanguageSelector
                selectedLanguage="python"
                onLanguageChange={mockOnChange}
            />
        );

        const select = screen.getByRole('combobox');
        expect(select).toHaveValue('python');
    });

    it('should call onChange when language is changed', () => {
        const mockOnChange = vi.fn();

        render(
            <LanguageSelector
                selectedLanguage="javascript"
                onLanguageChange={mockOnChange}
            />
        );

        const select = screen.getByRole('combobox');
        select.value = 'python';
        select.dispatchEvent(new Event('change', { bubbles: true }));

        expect(mockOnChange).toHaveBeenCalled();
    });
});
