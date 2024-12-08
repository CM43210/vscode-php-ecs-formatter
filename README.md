# PHP CS Fixer for Visual Studio Code

This extension allows you to run [Easy Coding Standard (ECS)](https://github.com/symplify/easy-coding-standard) directly from Visual Studio Code. You can also configure it as formatter for PHP files.

## Installation

1. Open the command palette (`F1`).
2. Select `Extensions: Install Extension`.
3. Search for "PHP ECS Formatter" and install the extension.

## Usage

- Use `Alt+Shift+F` (Windows/Linux) or `Option+Shift+F` (macOS) if you've set this extension as the default PHP formatter.
- **Command Palette:**
  - Press `F1` -> `php-ecs-formatter: fix this file` to format the currently open PHP file.
  - Press `F1` -> `php-ecs-formatter: diff` to compare the original and formatted versions of the currently open PHP file in a diff view.
- **Context Menu:**
  - Right-click in the editor and choose "Format Document", "Format Selection", or "Format Document With" to explicitly select a formatter.
  - Right-click a PHP file in the explorer and select `php-ecs-formatter: fix` or `php-ecs-formatter: diff`.

## Configuration

```JSON5
{
    "php-ecs-formatter.executablePath": "./vendor/bin/ecs", // Can be a relative or absolute path
    "php-ecs-formatter.configPath": "./ecs.php", // Can be a relative or absolute path
    "php-ecs-formatter.onsave": false,
}
```

## Requirements

Make sure ECS is installed in your project and accessible through the specified path in the configuration. For example, you can install ECS by running:

```bash
composer require symplify/easy-coding-standard --dev
```
