import { z } from 'zod'

import type {
  InputBooleanFieldOptions,
  InputEnumFieldOptions,
  InputNumberFieldOptions,
  InputStringFieldOptions,
} from '@/types/FieldOptions'
import { FormFieldsArray, GenericFieldOptions } from '@/types/FormFieldsArray'
import { MappedFieldOptions } from '@/types/UtilityTypes'
import {
  handleZodBoolean,
  handleZodEnum,
  handleZodNumber,
  handleZodString,
} from '@/utils/fieldHandlers'
import { setDefaultOptions } from '@/utils/formHelpers'

/**
 * Handles the conversion of Zod types to appropriate field options.
 * @param {z.ZodTypeAny} fieldValue - The Zod schema type.
 * @param {unknown} fieldOptions - Additional field options.
 * @param {string} fieldKey - Additional field options.
 * @throws Will throw an error if the Zod type is unsupported.
 * @returns {GenericFieldOptions} - Returns the corresponding field element.
 */
function handleFieldType<T extends z.AnyZodObject>(
  fieldKey: string,
  fieldValue: z.ZodTypeAny,
  fieldOptions?: GenericFieldOptions | MappedFieldOptions<T>
): GenericFieldOptions {
  const defaultOptions = setDefaultOptions(fieldKey, fieldValue)
  const options = { ...defaultOptions, ...fieldOptions }
  if (fieldValue instanceof z.ZodString) {
    return handleZodString(options as InputStringFieldOptions)
  } else if (fieldValue instanceof z.ZodNumber) {
    return handleZodNumber(options as InputNumberFieldOptions)
  } else if (fieldValue instanceof z.ZodBoolean) {
    return handleZodBoolean(options as InputBooleanFieldOptions)
  } else if (
    fieldValue instanceof z.ZodEnum ||
    fieldValue instanceof z.ZodNativeEnum
  ) {
    return handleZodEnum(options as InputEnumFieldOptions)
  }
  throw new Error(`Unsupported Zod type`)
}

/**
 * Creates and manages field options based on a Zod schema.
 * @param initialSchema The initial Zod schema.
 * @returns An object containing methods for manipulating field options.
 */
const createOptions = <T extends z.ZodRawShape>(
  initialSchema: z.ZodObject<T>
) => {
  let options: MappedFieldOptions<typeof initialSchema> = {}

  /**
   * Merges the provided field options with existing options.
   * @param fieldOptions The field options to merge.
   * @returns An object containing methods for further manipulation or to build the options. Chainable.
   */
  const withFieldOptions = (
    fieldOptions: MappedFieldOptions<typeof initialSchema>
  ) => {
    options = { ...options, ...fieldOptions }

    return { withFieldOptions, build }
  }

  /**
   * Builds the final options object.
   * @returns The built options object.
   */
  const build = () => {
    return options
  }

  return { withFieldOptions, build }
}

/**
 * Generates an array of form elements based on the given Zod schema and options.
 * @param {ZodObject<T>} schema - The Zod schema.
 * @param {MappedFieldOptions<K>} [options] - Additional field options.
 * @returns {FormFieldsArray} - Returns an array of form fields.
 * @template T, K
 */
const generateFields = <T extends z.ZodRawShape, K extends z.AnyZodObject>(
  schema: z.ZodObject<T>,
  options?: MappedFieldOptions<K>
): FormFieldsArray => {
  const finalResult: FormFieldsArray = []
  for (const [fieldName, fieldType] of Object.entries(schema.shape)) {
    if (fieldType instanceof z.ZodObject) {
      const nestedSchema = fieldType
      const nestedOptions = options?.[fieldName] as MappedFieldOptions<
        typeof nestedSchema
      >

      const generatedForm = generateFields(nestedSchema, nestedOptions)

      finalResult.push({ [fieldName]: generatedForm })

      continue
    }

    const fieldOptions = options?.[fieldName]
    const element = handleFieldType(fieldName, fieldType, fieldOptions)

    finalResult.push(element)
  }

  return finalResult
}

export { createOptions, generateFields, handleFieldType }
