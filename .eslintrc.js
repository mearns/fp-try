module.exports = {
    parser: "@typescript-eslint/parser",
    extends: ["standard", "plugin:prettier/recommended"],
    rules: {
        semi: [2, "always"],
        "no-extra-semi": 2,
        "semi-spacing": [2, { before: false, after: true }],
        "prettier/prettier": "error"
    },
    overrides: [
        {
            files: ["**/*.ts"],
            plugins: ["@typescript-eslint"],
            extends: [
                "standard",
                "plugin:prettier/recommended",
                "plugin:@typescript-eslint/eslint-recommended",
                "plugin:@typescript-eslint/recommended"
            ],
            rules: {
                "@typescript-eslint/no-use-before-define": [
                    "error",
                    { functions: false, classes: false }
                ],
                "@typescript-eslint/triple-slash-reference": 0
            }
        }
    ]
};
