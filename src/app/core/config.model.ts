interface AppConfig {
	title: string;
}

interface ApiDocsConfig {
	enabled: boolean;
	path: string;
}

interface BannerConfig {
	html: string;
	style: string;
}

interface FeedbackConfig {
	showFlyout: boolean;
	showInSidebar: boolean;
}

interface TeamConfig {
	implicitMembers: {
		strategy: string;
	};
}

interface UserPreferencesConfig {
	enabled: boolean;
	path: string;
}

export interface Config {
	auth: string;

	app: AppConfig;
	version: string;
	contactEmail: string;

	apiDocs: ApiDocsConfig;

	banner: BannerConfig;
	copyright: BannerConfig;

	teams: TeamConfig;

	feedback?: FeedbackConfig;

	userPreferences?: UserPreferencesConfig;
}
