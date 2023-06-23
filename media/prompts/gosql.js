const getFileNameAndExtension = ({filePath}) => {
    let path;
    try {
      path = require('path');
    } catch (error) {
      console.error("Error importing module:", error);
      return null;
    }
  
    const pathInfo = path.parse(filePath);
    console.log(pathInfo);
    return {
      extension: pathInfo.ext,
      fileName: pathInfo.name,
      fileFolder: pathInfo.dir,
    };
  };

module.exports = {
  namespace: "GoSqlx",
  commands: [
    {
      name: "Generate CreateFunc for an input model struct",
      template: `Task: Given a Go struct with properly defined database tags, generate the "Create" function code. This function should take an instance of input struct and insert it into the database.\n
            The input model struct is:\n
            {selection}\n
            Constraints:\n
            - Use the sqlx for MySQL and Squirrel libraries for database handling and query building respectively. Dont generate the database connection code.
            - Assume that string constants for the tablename and column names are available in a package called "spec". Dont use any hardcoded strings.
            - Use "ctx context.Context" as the first argument to the function. Use appropriate context methods from the packages.
            - Each function should appropriately handle any errors encountered during the database operation.
            - Write the function as a method on a Datalayer struct as: "type DL struct { db *sqlx.DB}"
            - Dont add any logging. Add appropriate comments.`,
      responseHandler: {
        func: "writeFile",
        args: {
          filePath: "user.dlFileName",
        },
      },
    },
    {
      name: "Generate ReadFunc for an input model struct",
      template: `Task: Given a Go struct with properly defined database tags, generate the "Read" function code. This function should take an id as input and return the database entry.\n
            The input model struct is:\n
            {selection}\n
            Constraints:\n
            - Use the sqlx for MySQL and Squirrel libraries for database handling and query building respectively. Dont generate the database connection code.
            - Assume that string constants for the tablename and column names are available in a package called "spec". Dont use any hardcoded strings.
            - Use "ctx context.Context" as the first argument to the function. Use appropriate context methods from the packages.
            - Each function should appropriately handle any errors encountered during the database operation.
            - Write the function as a method on a Datalayer struct as: "type DL struct { db *sqlx.DB}"
            - Dont add any logging. Add appropriate comments.`,
      responseHandler: {
        func: "writeFile",
        args: {
          filePath: "user.dlFileName",
        },
      },
    },
    {
      name: "Generate UpdateFunc for an input model struct",
      template: `Task: Given a Go struct with properly defined database tags, generate the "Update" function code. This function should take an instance of input struct and update the database entry.\n
            The input model struct is:\n
            {selection}\n
            Constraints:\n
            - Use the sqlx for MySQL and Squirrel libraries for database handling and query building respectively. Dont generate the database connection code.
            - Assume that string constants for the tablename and column names are available in a package called "spec". Dont use any hardcoded strings.
            - Use "ctx context.Context" as the first argument to the function. Use appropriate context methods from the packages.
            - Each function should appropriately handle any errors encountered during the database operation.
            - Write the function as a method on a Datalayer struct as: "type DL struct { db *sqlx.DB}"
            - Dont add any logging. Add appropriate comments.`,
      responseHandler: {
        func: "writeFile",
        args: {
          filePath: "user.dlFileName",
        },
      },
    },
    {
      name: "Generate DeleteFunc for an input model struct",
      template: `Task: Given a Go struct with properly defined database tags, generate the "Delete" function code. This function should take an id of input struct and delete the database entry.\n
            The input model struct is:\n
            {selection}\n
            Constraints:\n
            - Use the sqlx for MySQL and Squirrel libraries for database handling and query building respectively. Dont generate the database connection code.
            - Assume that string constants for the tablename and column names are available in a package called "spec". Dont use any hardcoded strings.
            - Use "ctx context.Context" as the first argument to the function. Use appropriate context methods from the packages.
            - Each function should appropriately handle any errors encountered during the database operation.
            - Write the function as a method on a Datalayer struct as: "type DL struct { db *sqlx.DB}"
            - Dont add any logging. Add appropriate comments.`,
      responseHandler: {
        func: "writeFile",
        args: {
          filePath: "user.dlFileName",
        },
      },
    },
    {
      name: "Generate CreateFunc: (no file write)",
      template: `Task: Given a Go struct with properly defined database tags, generate the "Delete" function code. This function should take an id of input struct and delete the database entry.\n
            The input model struct is:\n
            {selection}\n
            Constraints:\n
            - Use the sqlx for MySQL and Squirrel libraries for database handling and query building respectively. Dont generate the database connection code.
            - Assume that string constants for the tablename and column names are available in a package called "spec". Dont use any hardcoded strings.
            - Use "ctx context.Context" as the first argument to the function. Use appropriate context methods from the packages.
            - Each function should appropriately handle any errors encountered during the database operation.
            - Write the function as a method on a Datalayer struct as: "type DL struct { db *sqlx.DB}"
            - Dont add any logging. Add appropriate comments.`,
      responseHandler: {
        func: "getFileNameAndExtension",
        args: {
          filePath: "user.dlFileName",
        },
      },
    },
  ],
  functions: [
    getFileNameAndExtension,
  ],
  variables: [
    {
      name: "dlFileName",
      value: ({ baseFolder, fileName, fileExtension }) =>
        `${baseFolder}\\${fileName}_dl${fileExtension}`,
    },
  ],
};

