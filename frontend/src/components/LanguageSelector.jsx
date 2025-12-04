import { LANGUAGES } from '../utils/constants';
import './LanguageSelector.css';

const LanguageSelector = ({ selectedLanguage, onLanguageChange }) => {
    const languageOptions = Object.values(LANGUAGES);

    return (
        <div className="language-selector">
            <label htmlFor="language-select" className="selector-label">
                Language:
            </label>
            <div className="selector-wrapper">
                <select
                    id="language-select"
                    value={selectedLanguage}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    className="language-select"
                >
                    {languageOptions.map((lang) => (
                        <option key={lang.id} value={lang.id}>
                            {lang.icon} {lang.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default LanguageSelector;
