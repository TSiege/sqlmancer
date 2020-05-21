import JSON5 from 'json5'
import { parse } from 'doctrine'
import { annotations, AnnotationMap } from '../annotations'

export function parseAnnotations(originalDescription: string | undefined | null) {
  const { description, tags } = parse(originalDescription || '', { tags: Object.keys(annotations) })
  return {
    description,
    annotations: tags.reduce((acc, tag) => {
      const name = tag.title as keyof typeof annotations
      const Annotation = annotations[name] as any
      try {
        acc[name] = new Annotation(JSON5.parse(tag.description || 'null'))
      } catch (error) {
        error.message = `Invalid argument provided for annotation @${name}.\n${error.message}`
        throw error
      }
      return acc
    }, {} as AnnotationMap),
  }
}
