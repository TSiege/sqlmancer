import { BaseAnnotation } from './base'
import { AnnotationLocation } from '../types'

export class IgnoreAnnotiation extends BaseAnnotation<undefined> {
  locations: AnnotationLocation[] = ['FIELD_DEFINITION']
}
