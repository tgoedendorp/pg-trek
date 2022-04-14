import {TemplateType} from "../types/TemplateType.ts";
import fileExists from "./fileExists.ts";

/**
 * Returns a formatted version of the template type provided.
 * @param templateType The template to use. The template type must match a .txt file of the same name in /src/template.
 * @param data An object containing the variables to apply.
 */
export async function formatTemplate(templateType: string, data: unknown)
    : Promise<string> {
    const template = templateType as TemplateType;
    if (template === null) {
        throw new Error(`Template type ${templateType} is not supported`);
    }

    const templatePath = `./src/template/${templateType}.txt`;
    if (!(await fileExists(templatePath))) {
        return "";
    }

    return applyTemplate(Deno.readTextFileSync(templatePath), data);
}

/**
 * Applies the data provided to the interpolated string template.
 * @param template The template text.
 * @param data An object containing the data to apply.
 */
export function applyTemplate(template: string, data: unknown)
    : string {
    return new Function("return `" + template + "`;").call(data);
}
