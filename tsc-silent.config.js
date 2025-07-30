module.exports = {
  suppress: [
    {
      pathRegExp: "packages/seed-bible",
      codes: [
        // A return st atement can only be used within a function body
        1108,

        // Type 'X' is not assignable to type 'Y'
        2322,

        // Expected 2 arguments, but got 1
        2554,

        // Property 'x' does not exist on type 'Y'
        2339,

        // Subsequent variable declarations must have the same type.  Variable 'x' must be of type 'y', but here has type 'z'
        2403,

        // JSX elements cannot have multiple attributes with the same name
        17001,

        // Argument of type 'x' is not assignable to parameter of type 'y'
        2345,

        // Object literal may only specify known properties, and 'name' does not exist in type 'X'
        2353,

        // An object literal cannot have multiple properties with the same name
        1117,

        // No overload matches this call
        2769,

        // Cannot find name 'x'
        2304,

        // Object is possibly 'undefined'
        2532,

        // cannot find module
        2307,

        // spread types may only be created from object types
        2698,

        // type is missing the following properties from type
        2739,

        // export declaration conflicts with exported declaration of
        2484,

        // cannot r edeclare exported variable
        2323,

        // 'var' is possibly undefined
        18048,

        // an epxression of type 'void' cannot be tested for truthiness
        1345,

        // Property 'x' is missing in type 'Y' but required in type 'Z'
        2741,
      ],
    },
  ],
};
