import {readLine} from './readLine.ts';
import {switches} from "./switches.ts";
import log from "./log.ts";

/**
 * Returns true if the user answers "Y" or "yes" to the provided question text.
 * @param questionText The text to display when asking for confirmation.
 * @example const answerConfirmed = await confirm("Are you sure? Type Y or Yes to confirm.");
 */
export async function confirm(questionText: string)
    : Promise<boolean> {
    if (switches.alwaysAnswerYes) {
        log(questionText);
        log("yes");
        return true;
    }

    const answer = await readLine(`${questionText}\nType Y, y or yes and press enter to confirm or anything else to decline:`);
    return answer.length > 0 && (answer.toLocaleLowerCase() === "y" || answer.toLocaleLowerCase() === "yes");
}
