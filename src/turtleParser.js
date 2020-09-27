/*
- buffer (characters to parse)
- start (first character in buffer being parsed now)
- end (index of current character in buffer being parsed now)

- valid (is the production rule still a valid contender)
- satisfied (is the production rule fully satisfied)
*/

class RuleInstance {
  constructor(rule, buffer, start = 0) {
    this.rule = rule;
    this.buffer = buffer;
    this.start = start;
    this.length = 0;
    this.valid = true;
    this.satisfied = false;
  }

  get current() {
    return this.buffer[this.start + this.length - 1];
  }

  get fullString() {
    return this.buffer.substring(this.start, this.length);
  }

  next() {
    if (! this.valid || this.length >= this.buffer.length) {
      return false;
    }
    this.length = this.length + 1;
    const accepted = this.rule.next(this);
    if (! accepted) {
      this.length = this.length - 1;
    }
    console.log(this.rule.name, this.start, this.length, this.valid, accepted);
    return accepted;
  }
}

class Rule {
  constructor(name, next) {
    this.name = name;
    this.next = next;
  }

  instance(buffer, start) {
    return new RuleInstance(this, buffer, start);
  }
}

// class ParentRuleInstance extends RuleInstance {
//   constructor(rule, buffer, state, children = []) {
//     super(rule, buffer, state);
//     this.children = children;
//   }
// }

function characterClass(characters) {
  return new Rule('CharacterClass', (instance) => {
    if (instance.length === 1) {
      console.log('CharacterClass testing ', characters, characters.indexOf(instance.current));
      return instance.valid = instance.satisfied = characters.indexOf(instance.current) !== -1;
    }
    return false;
  });
}

function optional(wrappedRule) {
  return new Rule('Optional', (instance) => {
    instance.wrapped = instance.wrapped || wrappedRule.instance(instance.buffer, instance.start);
    const accepted = instance.wrapped.next();
    instance.valid = instance.wrapped.valid || !accepted && instance.length === 1;
    return accepted;
  });
}

function sequence(rules) {
  return new Rule('sequence', (instance) => {
    instance.wrapped = instance.wrapped || [rules[0].instance(instance.buffer, instance.start)];
    let current = instance.wrapped[instance.wrapped.length - 1];
    let accepted = current.next();
    while (! accepted && current.valid && rules.length > instance.wrapped.length) {
      current = rules[instance.wrapped.length].instance(instance.buffer, instance.start + instance.length - 1);
      instance.wrapped.push(current);
      accepted = current.next();
    }
    if (! accepted) {
      return instance.valid = instance.satisfied = current.valid;
    }
    instance.satisfied = rules.length === instance.wrapped.length && current.satisfied;
    return true;
  });
}

function oneOrMore(wrappedRule) {
  return new Rule('oneOrMore', (instance) => {
    instance.wrapped = instance.wrapped || [wrappedRule.instance(instance.buffer, instance.start)];
    let current = instance.wrapped[instance.wrapped.length - 1];
    let accepted = current.next();
    if (! accepted && current.valid) {
      current = wrappedRule.instance(instance.buffer, instance.start + instance.length - 1);
      if (current.next()) {
        instance.wrapped.push(current);
        accepted = true;
      }
    }
    if (! accepted) {
      return instance.valid = instance.satisfied = current.valid;
    }
    instance.satisfied = current.satisfied;
    return true;
  });
}

const digit = characterClass('0123456789');
const INTEGER = sequence([optional(characterClass('+-')), oneOrMore(digit)]);
const test = INTEGER.instance('+123');
test.next();
console.log(test);
test.next();
console.log(test);
test.next();
console.log(test);
test.next();
console.log(test);
