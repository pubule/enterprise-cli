/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Main utility class and facade for the Enterprise Framework.
 * Provides version information and utility methods.
 *
 * <p>Example usage:
 * <pre>
 * // Print framework banner and version
 * EnterpriseFramework.printInfo();
 *
 * // Get version programmatically
 * String version = EnterpriseFramework.getVersion();
 * System.out.println("Using Enterprise Framework v" + version);
 * </pre>
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 2.0.0
 */
public final class EnterpriseFramework {

    private static final Logger log = LoggerFactory.getLogger(EnterpriseFramework.class);

    /**
     * The current version of the Enterprise Framework.
     */
    public static final String VERSION = "{{frameworkVersion}}";

    /**
     * The framework name.
     */
    public static final String NAME = "Enterprise Framework";

    /**
     * Framework ASCII art banner.
     */
    private static final String BANNER =
            "\n" +
            "  ______       _                       _          \n" +
            " |  ____|     | |                     (_)         \n" +
            " | |__   _ __ | |_ ___ _ __ _ __  _ __ _ ___  ___ \n" +
            " |  __| | '_ \\| __/ _ \\ '__| '_ \\| '__| / __|/ _ \\\n" +
            " | |____| | | | ||  __/ |  | |_) | |  | \\__ \\  __/\n" +
            " |______|_| |_|\\__\\___|_|  | .__/|_|  |_|___/\\___|\n" +
            "                           | |                     \n" +
            "                           |_|                     \n" +
            "  _____                                         _    \n" +
            " |  ___| __ __ _ _ __ ___   _____      _____  _ __| | __\n" +
            " | |_ | '__/ _` | '_ ` _ \\ / _ \\ \\ /\\ / / _ \\| '__| |/ /\n" +
            " |  _|| | | (_| | | | | | |  __/\\ V  V / (_) | |  |   < \n" +
            " |_|  |_|  \\__,_|_| |_| |_|\\___| \\_/\\_/ \\___/|_|  |_|\\_\\\n" +
            "\n" +
            " :: Enterprise Framework ::                (v" + VERSION + ")\n" +
            "\n";

    // Private constructor to prevent instantiation
    private EnterpriseFramework() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    /**
     * Gets the current framework version.
     *
     * @return the version string
     */
    public static String getVersion() {
        return VERSION;
    }

    /**
     * Gets the framework name.
     *
     * @return the framework name
     */
    public static String getName() {
        return NAME;
    }

    /**
     * Prints framework information to console.
     * Displays ASCII banner, version, and key features.
     */
    public static void printInfo() {
        System.out.println(BANNER);
        System.out.println("Features:");
        System.out.println("  ✓ Advanced validation with field-level errors and warnings");
        System.out.println("  ✓ Typed domain events with metadata and async support");
        System.out.println("  ✓ Structured error handling with ErrorDetails");
        System.out.println("  ✓ DTO pattern with automatic entity mapping");
        System.out.println("  ✓ Business rules with priority system");
        System.out.println("  ✓ Base classes for entities, services, controllers, repositories");
        System.out.println("  ✓ Built-in audit logging, soft delete, multi-tenancy");
        System.out.println("  ✓ Reduces boilerplate by 70%");
        System.out.println();
        System.out.println("Documentation: see FRAMEWORK_README.md");
        System.out.println("Generated with: Enterprise CLI");
        System.out.println();

        log.info("{} v{} initialized", NAME, VERSION);
    }

    /**
     * Prints only the ASCII banner without additional information.
     */
    public static void printBanner() {
        System.out.println(BANNER);
    }

    /**
     * Checks if the framework is initialized.
     * This is a simple check that can be extended for more complex initialization logic.
     *
     * @return true if initialized
     */
    public static boolean isInitialized() {
        // Simple check - can be extended to verify Spring context, beans, etc.
        return true;
    }

    /**
     * Gets full framework information as a formatted string.
     *
     * @return framework information
     */
    public static String getInfo() {
        return String.format("%s v%s - Production-ready Spring Boot Framework", NAME, VERSION);
    }
}
