import inquirer from 'inquirer'
import Writer from '../../writer'
import { reportZodValidationErrors } from '../../../utils/reportValidationErrors'
import { ZodError } from 'zod'
import { AddItemPrompt, ContinuePrompt, EditItemPrompt, ExitPrompt, RemoveItemPrompt } from './promptOptions'

/**
 * Map list items to a human readable name to make it easier to display to the user
 */
export type ListOption<T> = {
    name: string
    value: { item: T, id?: number }
}

export abstract class ListOptionsPrompt<T> {
    abstract messagePrompt: string
    abstract itemType: string
    writer: Writer
    list: ListOption<T>[]
    constructor(list: T[], writer: Writer) {
        this.list = this.transformToListOptions(list)
        this.writer = writer
    }

    /**
     * Returns the list of possible options for this List
     * @returns
     */
    options(): { name: string, value: string }[] {
        return [
            ContinuePrompt,
            AddItemPrompt(this.itemType),
            EditItemPrompt(this.itemType),
            RemoveItemPrompt(this.itemType),
            ExitPrompt
        ]
    }

    /**
     * Prompts the user to select an option from the list of options()
     * @returns One of the options from the options() method
     */
    async promptListOptions() {
        const response = await inquirer.prompt([{
            name: 'listPromptOption',
            message: 'Select an action:',
            type: 'list',
            choices: this.options()
        }])
        return response.listPromptOption
    }

    /**
     * Implementation should be prescribed by the specific subclass for adding
     * and editing the list of items
     */
    abstract promptAddItem(): Promise<ListOption<T>>
    abstract promptEditItem(list: ListOption<T>[]): void

    /**
     * Returns a list of indices to remove from the list
     * @param ListOption<T>[]
     * @returns number[]
     */
    async promptDeleteItems(list: ListOption<T>[]): Promise<number[]> {
        const responses = await inquirer.prompt([{
            name: 'itemsToDelete',
            message: `Select the ${this.itemType} you would like to delete:`,
            type: 'checkbox',
            choices: list
        }])
        return responses.itemsToDelete.map((option: T) => list.findIndex((item) => item.value === option))
    }

    /**
     * Returns the position of the item to move and the position to move it to
     * @param ListOption<T>[]
     * @returns [number, number]
     */
    async promptReorderItem(list: ListOption<T>[]) {
        const itemToMove = await inquirer.prompt([{
            name: 'itemToReorder',
            message: `Select the ${this.itemType} you would like to move:`,
            type: 'list',
            choices: list
        }])

        const itemToMoveTo = await inquirer.prompt([{
            name: 'itemNewIndex',
            message: `Select the position you would like to move the ${this.itemType} to:`,
            type: 'list',
            choices: list
        }])
        const positions = [
            list.findIndex((item) => item.value === itemToMove.itemToReorder),
            list.findIndex((item) => item.value === itemToMoveTo.itemNewIndex)
        ]
        return positions
    }

    /**
     * Prompts the user to add, edit, remove, reorder to a list passed into the constructor
     * when creating an instance of this class. Returns the list with the changes made if they choose
     * continue, or the original list if they choose exit. The format of the list returned is of the original
     * type passed into the constructor, not the ListOption type.
     * @param ListOption<T>[]
     * @returns T[]
     */
    async prompt(list?: ListOption<T>[]): Promise<T[]> {
        const newList = [...(list || this.list)] as ListOption<T>[]

        // if there's no list passed in, this should be the first prompt call and thus we should print the list
        if (!list) {
            this.printListOptions(newList)
        }

        const response = await this.promptListOptions()
        try {
            switch (response) {
                case 'add':
                    const newItem = await this.promptAddItem()
                    newItem.value.id = newList.length
                    newList.push(newItem)
                    break
                case 'edit':
                    await this.promptEditItem(newList)
                    break
                case 'remove':
                    const indicesToDelete = await this.promptDeleteItems(newList)
                    indicesToDelete.reverse().forEach((index) => newList.splice(index, 1))
                    break
                case 'reorder':
                    if (newList.length < 2) {
                        this.writer.showError(`You must have at least 2 ${this.itemType}s to reorder.`)
                        break
                    }
                    const [oldIndex, newIndex] = await this.promptReorderItem(newList)
                    const itemToMove = newList[oldIndex]
                    newList.splice(oldIndex, 1)
                    newList.splice(newIndex, 0, itemToMove)
                    break
                case 'continue':
                    break
                case 'exit':
                    return this.list.map((item) => item.value.item) as unknown as T[]
            }
        } catch (e) {
            if (e instanceof ZodError) {
                reportZodValidationErrors(e, this.writer)
            } else if (e instanceof Error) {
                this.writer.showError(e.message)
            }
        }
        this.printListOptions(newList)
        this.writer.divider()
        // keep prompting until they choose to continue with the saved changes to the list
        if (response !== 'continue') {
            return this.prompt(newList)
        }
        return newList.map((item) => item.value.item)
    }

    /**
     * Prints the list of human-readable names of the list to the console
     * @param ListOption<T>[]
     */
    async printListOptions(list?: ListOption<T>[]) {
        const listToPrint = list || this.list
        this.writer.blankLine()
        this.writer.title(this.messagePrompt)
        this.writer.infoMessage(`Current ${this.itemType}s:`)
        this.writer.list(listToPrint.map((item) => item.name))
        this.writer.blankLine()
    }

    /**
     * Each subclass should decide how to name each item in the list appropriately
     * @param T[]
     */
    abstract transformToListOptions(list: T[]): ListOption<T>[]

}
