// Type definitions
export enum HostEnvironment {
	PRODUCTION,
	DEVELOPMENT,
}

interface HostConfig {
	Environment: HostEnvironment;
}

// Actual config
const Config: HostConfig = {
	// The environment (Production will use DATABASE, while Development will use DEV_DATABASE)
	Environment: HostEnvironment.DEVELOPMENT,
};

export default Config;
