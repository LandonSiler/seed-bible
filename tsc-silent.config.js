module.exports = {
  suppress: [
    {
      pathRegExp: "packages/seed-bible",
      codes: [
        // IMPORTANT ONES - these are checks that should be fixed ASAP because
        // they point out bugs

        // Cannot assign to 'x' because it is a constant
        2588,

        // Operator 'x' cannot be applied to types 'y' and 'z'
        2365,

        // This comparison appears to be unintentional because the types 'x' and 'y' have no overlap
        2367,

        // An arithmetic operand must be of type 'any', 'bigint', 'number', or an enum type
        2356,

        // Type 'X' is not assignable to type 'Y'
        2322,

        // Property 'x' does not exist on type 'Y'
        2339,

        // No overload matches this call
        2769,

        // Expected 2 arguments, but got 1
        2554,

        // Argument of type 'x' is not assignable to parameter of type 'y'
        2345,

        // an epxression of type 'void' cannot be tested for truthiness
        1345,

        // Property 'x' is missing in type 'Y' but required in type 'Z'
        2741,

        // Left side of comma operator is unused and has no side effects
        2695,

        // JSX elements cannot have multiple attributes with the same name
        17001,

        // An object literal cannot have multiple properties with the same name
        1117,

        // Cannot find name 'x'
        2304,

        // type is missing the following properties from type
        2739,

        // Less important ones. These issues should probably be fixed eventually, but they are not as critical as the above ones.
        // Subsequent variable declarations must have the same type.  Variable 'x' must be of type 'y', but here has type 'z'
        2403,

        // Object literal may only specify known properties, and 'name' does not exist in type 'X'
        2353,

        // Object is possibly 'undefined'
        2532,

        // spread types may only be created from object types
        2698,

        // export declaration conflicts with exported declaration of
        2484,

        // cannot redeclare exported variable
        2323,

        // 'var' is possibly undefined
        18048,

        // Needed for CasualOS
        // A return st atement can only be used within a function body
        1108,

        // cannot find module
        2307,
      ],
    },
  ],
};
