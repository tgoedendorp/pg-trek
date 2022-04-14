# pg-trek 🐘🐘
![Typescript](https://img.shields.io/badge/typescript-v4.x-blue)
![Deno](https://img.shields.io/badge/deno-v1.20+-blueviolet)
![Postgresql](https://img.shields.io/badge/postgresql-v12+-brightgreen)
![Contributions welcome](https://img.shields.io/badge/contributions-welcome-orange.svg)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://www.apache.org/licenses/LICENSE-2.0)

---

## Introduction
Pg-trek is a database update and maintenance command line tool for Postgresql databases that aims to be user-friendly and easy to adapt to your own needs and can be run locally as well as in CI/CD pipelines. 
It provides an obvious and easy to follow structure to keep your database up to date, templates for some common scenarios and rollback options.  

## Table of contents
[Installation](#installation)<br>
[Application structure]()<br>
[Migration]()<br>
&nbsp;&nbsp;&nbsp;&nbsp;[add](#add) | [migrate](#migrate) | [info](#info)<br>
[Rollback operations](#rollback-operations)<br>
&nbsp;&nbsp;&nbsp;&nbsp;[rollback](#rollback) | [rollbackto](#rollbackto)<br>
[Migration template commands](#migration-template-commands)<br>
&nbsp;&nbsp;&nbsp;&nbsp;[create](#create) | [alter](#alter) | [drop](#drop) | [get](#get) | [getdb](#getdb)<br>
[Configuration](#configuration)<br>
&nbsp;&nbsp;&nbsp;&nbsp;[Set the target database](#set-the-target-database)<br>
&nbsp;&nbsp;&nbsp;&nbsp;[Global settings](#global-settings)<br>
&nbsp;&nbsp;&nbsp;&nbsp;[Switches](#switches)<br>
[Templates](#templates)<br>

## Installation
Pg-trek uses [Deno](https://deno.land/) as the application runtime because it is small, runs on multiple platforms and supports Typescript out of the box. Download Deno [here](https://deno.land/#installation).

Download the source ZIP and extract the contents to the desired location on your machine or clone a branch from the repository.

Change the database and application settings in the `.env` file. See the Configuration section for more details.

## Application structure
````
├── database             |  Migrations folder
│   ├── migration        |   Typescript migration scripts. Use add, create, alter or drop to create migration scripts
│   ├── schema           |   SQL scripts matching database schema objects. use getdb or get to generate scripts from existing database objects
│   │   ├── function     |    Functions
│   │   ├── procedure    |    Procedures
│   │   ├── table        |    Tables
│   │   ├── trigger      |    Triggers
│   │   └── view         |    Views
│   └── sqlscript        |   Miscellaneous SQL scripts
├── src                  |  Application folder
│   ├── command          |   Application commands
│   ├── db               |   Database access and repositories
│   ├── template         |   Migration and SQL script template files
│   └── util             |   Application utility code
├── main.ts              |  Main application
└── .env                 |  Global settings file
````

### database
This folder contains the migration and SQL scripts used to update your database. 

If you want to move this folder to another location, also set the new location in setting `MIGRATIONS_FOLDER` in the `.env` file. 

You may want to consider putting this folder under source control, or the entire application if you also make changes in the `src` folder. Having version history, commit messages and blame may help a lot.

### src
This folder contains the application code and template script files. The application is written in Typescript to make it easy to change and extend the application without the need of complex tools and compilers. Just modify or add your own Typescript code using a text editor and run it with Deno. 

## Migration scripts
A migration script is a Typescript class with a timestamped file name that contains logic to make changes to the target database.
The migration script supports running SQL commands by the provided `Sql` utility class and through [Deno Postgres package](https://deno-postgres.com/#/). 

Migration scripts are executed through the command `migrate`.
This command runs all migration scripts which have not been (successfully) executed before in ascending order and assigns a batch ID to all successfully executed migrations.

Any TypeScript class in the migration folder which implements the interface `IMigration` and exports an instance of itself as default, is considered a valid migration script. 
Use the `add` command to generate a timestamped migration script based on a template, or add one manually.

### add
`add <migration name>`

Adds a new Typescript class to the `migrations` folder where you can define your data migration logic.
If you don't provide a name for the migration, you will be asked to provide one. 

If the `CODE_EDITOR` setting in the `.env` settings file is set, the new migration file will be opened in the configured editor.

The generated migration script is based on the template `src/templates/new-migration.txt`.

###### Usage

`deno run --allow-all main.ts add`

`deno run --allow-all main.ts add "update stock info"`

`deno run --allow-all main.ts add create_table_users`

------

### Run the data migration process
#### migrate
`migrate`

Calls `execute()` on all unprocessed migrations. The process will check for each 
migration script in the `migrations/` folder against the `DB_MIGRATION_TABLE`. If
the migration does not exist, `execute()` will be called and an entry added to
`DB_MIGRATION_TABLE`.

If the target database does not exist and the `.env` setting `CREATE_DB_IF_NOT_EXISTS` is set to `true`, the migration
process will attempt to create the database. The provided user must have the create database permission in the `postgres` 
database. If the setting is not set to true or the user does not have sufficient permissions results in an error message 
if the target database does not exist.

###### Usage

`deno run --allow-all main.ts migrate`

`deno run --allow-all main.ts migrate -database my_app`

###### Note
If the database does not exist, the application will attempt to create one on the server using the name from option `-database`  or if not specified from the environment variable `DB_NAME` in the `.env` settings file.

The user specified in the settings file `.env` must have sufficient privileges to access the `postgres` database with `CREATE DATABASE` permissions.

------

### info
`info`

The `info` command shows an overview of the last executed migrations.

###### Usage
`deno run --allow-all main.ts info`

------

### Rollback operations
The rollback commands call the `rollback()` method on the specified migration script(s) and deletes the entry from the log so the migration script will be executed again upon the next call to `migrate`.

In most scenarios it is by far easier to simply add a new migration which fixes the problem instead of using the rollback options.
The rollback operations are to support advanced rollback scenarios for instance to revert complex permutations, trigger a specific database backup restore, etc.

Rollback operations are not performed automatically upon failure. Use the commands `rollback` or `rollbackto` to run a rollback operation.

#### rollback
`rollback <migration ID | migration batch ID>`

Calls `rollback()` on the specified migration or batch of migrations.

###### Usage

`deno run --allow-all main.ts rollback 20211029073410_add_column_datemodified.ts`

or

`deno run --allow-all main.ts rollback 20211029073410_add_column_datemodified`

<br>
Calls `rollback()` on all migrations in the specified batch.

`deno run --allow-all main.ts rollback IC728BJHS`

------

#### rollbackto
`rollbackto <migration ID | migration batch ID>`

Calls `rollbackto()` on all migrations from newest to oldest up until and including the specified migration or batch of migrations.

###### Usage

`deno run --allow-all main.ts rollbackto 20211028132433_create_table_users.ts`

`deno run --allow-all main.ts rollbackto 20211028132433_create_table_users`
<br>

Calls `rollbackto()` on all migrations in all batches up to and including the specified batch ID.

`deno run --allow-all main.ts rollbackto IC728BJHS`

------

### Migration template commands
The following commands generate scaffolded migration and SQL scripts for common scenarios. 

#### create
`create [function | procedure | schema | sequence | table | view] <name>`

Creates a new SQL script with basic CREATE statement scaffolding and a new migration script based on the database object type defined. If the setting `CODE_EDITOR` is configured, the SQL and migration script will be opened in this editor. NB: If the name provided contains no scheme and if applicable, `public` is assumed.

###### Usage

`deno run --allow-all main.ts create table contact`

`deno run --allow-all main.ts create view identity.active_users`

The templates for `create` are located in `.\src\templates\create-*.txt`

The SQL script will be created in `.\database\schema\<database object type>\ `

------

#### alter
`alter [function | procedure | schema | sequence | table | view] <name>`

Creates a new migration script for the matching SQL script based on the database object type and name defined. If the setting `CODE_EDITOR` is configured, the SQL and migration script will be opened in this editor. NB: If the name provided contains no scheme and if applicable, `public` is assumed.

###### Usage

`deno run --allow-all main.ts alter table contact`

`deno run --allow-all main.ts alter view identity.active_users`

------

#### drop
`drop [function | procedure | schema | sequence | table | view] <name>`

Creates a new migration script with a `DROP` statement pre-filled for the provided database object type and name. 
If a matching script exists in the `\schema` folder, the application will ask whether you want to delete or keep the file.

###### Usage

`deno run --allow-all main.ts drop table contact`

`deno run --allow-all main.ts drop view identity.active_users`

------

#### getdb
`deno run --allow-all main.ts getdb`

Generates `CREATE` SQL scripts for all existing database objects in the `/schema` folder. The script file names will be in the form of `schema/[object type]/[schema].[object name].sql`.

This command generates only SQL scripts and no migration scripts. If you want to have migration scripts generated, add the switch `-withmigration` to the command. Be careful though: the order in which the scripts are generated is likely not be the order in which the objects should be created in the database.

###### Usage

`deno run --allow-all main.ts getdb -withmigration`

If a SQL script file already exists, it will be ignored. Use switch `-overwrite` to always overwrite existing files or `-ask` to decide per file.  

`deno run --allow-all main.ts getdb -ask`

------

#### get
`deno run --allow-all main.ts get [function | procedure | schema | sequence | table | view] <name>`

Generates a `CREATE` SQL script for the requested database object. The script file name will be in the form of `schema/[object type]/[schema].[object name].sql`.

This command generates only a SQL script and no migration script. If you want to have a migration script generated, add the switch `-withmigration` to the command:

###### Usage

`deno run --allow-all main.ts get table public.contacts -withmigration`

If the SQL script file already exists, it will be ignored. Use switch `-overwrite` to always overwrite the file or `-ask` to ask for confirmation.

`deno run --allow-all main.ts get view public.activecontacts -overwrite`

## Configuration

### Set the target database
You can either set the target database globally by editing the setting `DB_NAME` in the settings file
`.env` or by adding the switch `-database <db name>` to the command to override the `DB_NAME` setting. For example:

Use database from the `DB_NAME` global setting in `.env`:<br>
`deno run --allow-all main.ts migrate`

Define the database on the command line to override the global setting:<br>
`deno run --allow-all main.ts migrate -database my_app`

This applies to the commands `migrate`, `rollback`, `rollbackto`, `get` and `getdb`.

You can also override all database settings by using the switch `-connectionstring`:

`deno run --allow-all main.ts migrate -connectionstring postgres://localhost:5432/my_app_db`

### Global settings
To change global application settings, edit the `.env` file in the application's root folder.

| Setting                 | Value                                                                                                                                                                                                                            |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| DB_SERVER               | The host name or IP address of the Postgresql server to connect to                                                                                                                                                               |
| DB_PORT                 | The port on which the Postgresql server listens                                                                                                                                                                                  |
| DB_NAME                 | The name of the database to apply the migrations on                                                                                                                                                                              |
| DB_USER                 | The username to use to connect to the Postgresql database                                                                                                                                                                        |
| DB_PWD                  | The password to use to connect to the Postgresql database                                                                                                                                                                        |
| CONNECTION_RETRY        | The number of times to try to (re)connect to the database server. Defaults to 5                                                                                                                                                  | 
| CREATE_DB_IF_NOT_EXISTS | When this is set to `true`, the target database will be automatically created when it does not exist on the configured server. If the value is set to `false`, an error will be displayed instead if the database does not exist |
| PG_BIN_FOLDER           | The location of the bin folder of your Postgres installation                                                                                                                                                                     | 
| DB_MIGRATION_TABLE      | The table name where the migration log will be kept                                                                                                                                                                              |
| MIGRATIONS_FOLDER       | The location where the migration and SQL scripts are stored                                                                                                                                                                      |
| CODE_EDITOR             | Optional. The path to the executable of the editor in which you want a migration or sql script to be opened after creation                                                                                                       | 

### Switches
Switches are optional and can be added at the end of a command to change the default behaviour or override global settings.

| Switch                       | Description                                                                                                                                                                                         |
|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `-database <name>`           | Sets the name of the target database. Overrides the global setting `DB_NAME` in the `.env` settings file                                                                                            |
| `-connectionstring <value>`  | A Postgresql connection string in the format `postgres://user:password@hostname:port/database?application_name=application_name`. Overrides switch `-database` and the settings in the `.env` file  |
| `-migrationsfolder <folder>` | Sets the location of the migration and SQL scripts folder. Overrides the global setting `MIGRATIONS_FOLDER` in the `.env` settings file                                                             |
| `-withmigration`             | Ensures a new migration script is generated. Use in combination with command `get` or `getdb`                                                                                                       |
| `-log:silent`                | Output error messages only. Ignored when also `-log:verbose` is defined                                                                                                                             |
| `-log:verbose`               | Output extra information. Overrides `-log:silent`                                                                                                                                                   |
| `-y` or `-yes`               | Automatically answer `yes` on confirmation requests                                                                                                                                                 |
| `-overwrite`                 | When specified overwrites existing files                                                                                                                                                            |

## Templates

Templates are text files used by the application to generate SQL and Typescript migration scripts. The files are located in the application folder `src/template`.

------------------------------------------------------------------------------------------------------------
| Template                      | Description                                                                                                   |
|-------------------------------|---------------------------------------------------------------------------------------------------------------|
| create-database.txt           | `CREATE DATABASE` SQL template. Used when the target database does not exist                                  |
| create-function.txt           | `CREATE FUNCTION` SQL template. Used by command `create function`                                             |
| create-procedure.txt          | `CREATE PROCEDURE` SQL template. Used by command `create procedure`                                           |
| create-table.txt              | `CREATE TABLE` SQL template. Used by command `create table`                                                   |
| create-view.txt               | `CREATE VIEW` SQL template. Used by command `create view`                                                     |
| new-migration.txt             | Typescript migration script template used by command `add`                                                    |
| new-migration-from-create.txt | Typescript migration script template used by commands `create` and `get`/`getdb` with switch `-withmigration` |
| new-migration-from-drop.txt   | Typescript migration script template used by command `drop`                                                   |

