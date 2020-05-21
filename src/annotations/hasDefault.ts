import { BaseAnnotation } from './base'
import { AnnotationLocation } from '../types'

export class HasDefaultAnnotiation extends BaseAnnotation<undefined> {
  locations: AnnotationLocation[] = ['FIELD_DEFINITION']
}
