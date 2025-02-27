export type Locale =
    | 'en' // English
    | 'zh' // Chinese
    | 'es' // Spanish
    | 'ar' // Arabic
    | 'hi' // Hindi
    | 'fr' // French
    | 'ru' // Russian
    | 'pt' // Portuguese
    | 'id' // Indonesian
    | 'de'; // German

export interface Config {
    auth: {
        token: string | null;
    };
    settings: {
        autoStage: boolean;
        smartGroupping: boolean;
        locale: Locale;
    };
}
