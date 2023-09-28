import { z } from 'zod'

import type {
  InputBooleanFieldOptions,
  InputNumberFieldOptions,
  InputStringFieldOptions,
} from '@/types/FieldOptions'
import { MappedFieldOptions } from '@/types/UtilityTypes'
import { createOptions, generateFields } from '@/utils/formGenerator'

describe('formGenerator', () => {
  describe('generateFields', () => {
    it('should generate form elements', () => {
      // Arrange
      const schema = z.object({
        username: z.string(),
        age: z.number(),
        isAdmin: z.boolean(),
      })
      const options: MappedFieldOptions<typeof schema> = {
        username: { placeholder: 'Username' } as InputStringFieldOptions,
        age: { placeholder: 'Age' } as InputNumberFieldOptions,
        isAdmin: {
          label: 'Is Admin?',
          type: 'radio',
        } as InputBooleanFieldOptions,
      }

      // Act
      const elements = generateFields(schema, options)

      // Assert
      expect(elements).toEqual([
        {
          id: 'username',
          label: 'Username',
          name: 'username',
          type: 'text',
          placeholder: 'Username',
          tag: 'input',
        },
        {
          id: 'age',
          label: 'Age',
          name: 'age',
          placeholder: 'Age',
          type: 'number',
          tag: 'input',
          inputMode: 'numeric',
        },
        {
          id: 'isAdmin',
          label: 'Is Admin?',
          name: 'isAdmin',
          tag: 'input',
          type: 'radio',
        },
      ])
    })
  })
  describe('generateFormElementsFromScheme with nested fields', () => {
    it('should generate form with nested forms', () => {
      // Arrange
      const schema = z.object({
        surname: z.string(),
        address: z.object({
          street: z.string(),
          city: z.string(),
          code: z.number(),
          subAddress: z.object({
            subStreet: z.string(),
          }),
          country: z.string(),
        }),
        name: z.string(),
      })

      const options = createOptions(schema).build()

      // Act
      const form = generateFields(schema, options)

      // Assert
      const expectedForm = [
        {
          id: 'surname',
          label: 'Surname',
          name: 'surname',
          tag: 'input',
          type: 'text',
        },
        {
          address: [
            {
              id: 'street',
              label: 'Street',
              name: 'street',
              tag: 'input',
              type: 'text',
            },
            {
              id: 'city',
              label: 'City',
              name: 'city',
              tag: 'input',
              type: 'text',
            },
            {
              id: 'code',
              inputMode: 'numeric',
              label: 'Code',
              name: 'code',
              tag: 'input',
              type: 'number',
            },
            {
              subAddress: [
                {
                  id: 'subStreet',
                  label: 'SubStreet',
                  name: 'subStreet',
                  tag: 'input',
                  type: 'text',
                },
              ],
            },
            {
              id: 'country',
              label: 'Country',
              name: 'country',
              tag: 'input',
              type: 'text',
            },
          ],
        },
        {
          id: 'name',
          label: 'Name',
          name: 'name',
          tag: 'input',
          type: 'text',
        },
      ]

      expect(form).toEqual(expectedForm)
    })
  })
})
