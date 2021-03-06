import { BaseFormViewModel } from "lib/baseFormViewModel";
import { Authority, IAuthorityService } from "lib/services/authority";
import { PolygonData } from "lib/services/authority/authority";
import { SaveResult } from "lib/services/interface";
import { action, computed, makeObservable, observable } from "mobx";

export abstract class AuthorityViewModel extends BaseFormViewModel {
  authorityService: IAuthorityService;

  _code: string = "";
  _name: string = "";
  _area?: PolygonData = undefined;
  _authorityInherits: string[] = [];

  constructor(authorityService: IAuthorityService) {
    super();
    makeObservable(this, {
      _code: observable,
      _name: observable,
      _authorityInherits: observable,
      code: computed,
      name: computed,
      authorityInherits: computed,
      save: action,
      validate: action,
      addAuthorityInherits: action,
      removeAuthorityInherits: action,
    });
    this.authorityService = authorityService;
  }

  public get code() {
    return this._code;
  }

  public set code(value: string) {
    this._code = value;
    delete this.fieldErrors["code"];
    if (this.submitError.length > 0) {
      this.submitError = "";
    }
  }

  public get name() {
    return this._name;
  }

  public set name(value: string) {
    this._name = value;
    delete this.fieldErrors["name"];
    if (this.submitError.length > 0) {
      this.submitError = "";
    }
  }

  public get area() {
    return this._area;
  }

  public set area(value: PolygonData | undefined) {
    this._area = value;
    delete this.fieldErrors["area"];
    if (this.submitError.length > 0) {
      this.submitError = "";
    }
  }

  public get authorityInherits(): string[] {
    return this._authorityInherits;
  }
  public set authorityInherits(value: string[]) {
    this._authorityInherits = value;
    delete this.fieldErrors["authorityInherits"];
    if (this.submitError.length > 0) {
      this.submitError = "";
    }
  }

  public abstract _save(): Promise<SaveResult<Authority>>;

  public async save(): Promise<boolean> {
    this.isSubmitting = true;

    if (this.validate()) {
      var result = await this._save();

      this.isSubmitting = false;

      if (!result.success) {
        if (result.message) {
          this.submitError = result.message;
        }
        if (result.fields) {
          this.fieldErrors = result.fields;
        }
      }
      return result.success;
    }
    this.isSubmitting = false;
    return false;
  }

  validate(): boolean {
    let isValid = true;
    if (this.code.length === 0) {
      isValid = false;
      this.fieldErrors["code"] = "this field is required";
    }

    if (this.name.length === 0) {
      isValid = false;
      this.fieldErrors["name"] = "this field is required";
    }
    return isValid;
  }

  async addAuthorityInherits(authorityId: string) {
    const idx = this.authorityInherits.findIndex(it => it === authorityId);
    if (idx === -1) {
      this.authorityInherits.push(authorityId);
    }
  }

  removeAuthorityInherits(authorityId: string) {
    const idx = this.authorityInherits.findIndex(it => it === authorityId);
    if (idx > -1) {
      this.authorityInherits.splice(idx, 1);
    }
  }
}
