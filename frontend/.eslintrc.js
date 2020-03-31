module.exports = {
    extends: [
        "airbnb"
    ],
    parser: "babel-eslint",
    plugins: [
        "react"
    ],
    globals: {
        "window": true,
        "document": true
    },
    settings: {
        "import/resolver": {
            "alias": [
                ["@", "./src"]
            ]
        }
    },
    rules: {
        "no-await-in-loop": 0,
        "arrow-body-style": 0,
        "comma-dangle": 0,
        "indent": 0,
        "import/prefer-default-export": 0,
        "linebreak-style": 0,
        "max-len": 0,
        "no-param-reassign": 0,
        "no-plusplus": 0,
        "no-shadow": 0,
        "prefer-arrow-callback": 0,
        "react/prop-types": 0,
        "react/state-in-constructor": 0,
        "react/prefer-stateless-function": 0,
        "react/jsx-indent": 0,
        "react/jsx-indent-props": 0,
        "react/jsx-props-no-spreading": 0,
        "react/no-array-index-key": 0,
        "react/jsx-filename-extension": [
            1,
            {
                "extensions": [
                    ".js",
                    ".jsx"
                ]
            }
        ]
    }
};