export abstract class IValidator {
	abstract verify(obj: any): boolean | Promise<boolean>;
}
