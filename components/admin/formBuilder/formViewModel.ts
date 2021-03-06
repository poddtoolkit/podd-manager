import { SectionViewModel } from "components/admin/formBuilder/section";
import {
  Definition,
  MovableItemsViewModel,
  ParseError,
} from "components/admin/formBuilder/shared";
import { action, computed, makeObservable, observable } from "mobx";

export class FormViewModel extends MovableItemsViewModel<SectionViewModel> {
  sections = Array<SectionViewModel>();
  currentSection: SectionViewModel | undefined = undefined;

  constructor() {
    super("", "");
    makeObservable(this, {
      sections: observable,
      currentSection: observable,
      addSection: action,
      selectSection: action,
      parse: action,
      jsonString: computed,
    });
  }

  get movableItems() {
    return this.sections;
  }

  addSection() {
    const id = crypto.randomUUID();
    const section = new SectionViewModel(id, "Section ...");
    this.sections.push(section);
  }

  selectSection(id: string) {
    this.currentSection?.unsetCurrent();
    this.currentSection = undefined;

    const section = this.sections.find(section => section.id === id);
    if (section) {
      this.currentSection = section;
      section.setCurrent();
      // Reset currently selected question
      section.selectQuestion("");
    }
  }

  parse(definition: Definition) {
    this.currentSection?.unsetCurrent();
    this.currentSection = undefined;
    try {
      if (Array.isArray(definition.sections)) {
        const sections = Array<SectionViewModel>();

        definition.sections.forEach(sectionDefinition => {
          const id = crypto.randomUUID();
          const sectionViewModel = new SectionViewModel(id, "Section");
          sectionViewModel.parse(sectionDefinition);
          sections.push(sectionViewModel);
        });
        this.sections.splice(0, this.sections.length, ...sections);
      } else {
        this.sections.splice(0, this.sections.length);
      }
    } catch (e) {
      if (e instanceof ParseError) {
        throw e;
      } else {
        throw new ParseError(
          "Error while building a form from given definition"
        );
      }
    }
  }

  toJson() {
    const json: Definition = {};
    const sections = Array<Definition>();
    this.sections.forEach(section => {
      sections.push(section.toJson());
    });
    json.sections = sections;
    return json;
  }

  get jsonString(): string {
    return JSON.stringify(this.toJson(), null, 2);
  }
}
