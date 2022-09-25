// Oblivion stat tracker
// Javascript logic
var attrs = [
  "Strength", 
  "Endurance",
  "Speed",
  "Agility",
  "Personality",
  "Intelligence",
  "Willpower"
];

var skills = {
  Strength: ["Blade", "Blunt", "Hand to Hand"],
  Endurance: ["Armorer", "Block", "Heavy Armor"],
  Speed: ["Athletics", "Acrobatics", "Light Armor"],
  Agility: ["Security", "Sneak", "Marksman"],
  Personality: ["Mercantile", "Speechcraft", "Illusion"],
  Intelligence: ["Alchemy", "Conjuration", "Mysticism"],
  Willpower: ["Alteration", "Destruction", "Restoration"]
}

function slug_name(skill) {
  return skill.toLowerCase().replace(/ /g, "-");
}

function each_skill(fn, args) {
  for (const attr in skills) {
    for (const i in skills[attr]) {
      const skill = skills[attr][i];
      fn(skill, args);
    }
  }
}

function new_element(html) {
  html = html.trim();
  var template = document.createElement("template");
  template.innerHTML = html;
  return template.content.firstChild;
}

function increase_skill(skill_id) {
  const elem = document.querySelector(skill_id);
  const val = (parseInt(elem.value) || 0) + 1;
  elem.value = (val <= 10)? val : 10;

  recalculate_attribute();
}
function decrease_skill(skill_id) {
  const elem = document.querySelector(skill_id);
  const val = (parseInt(elem.value) || 0) - 1;
  elem.value = (val >= 0)? val : 0;

  recalculate_attribute();
}

function set_skill_value (skill, value) {
  const query = "#skill-" + slug_name(skill) + "-input";
  const skill_elem = document.querySelector(query);
  skill_elem.value = value;

  recalculate_attribute();
}

function get_skill_value(skill) {
  const query = "#skill-" + slug_name(skill) + "-input";
  const elem = document.querySelector(query);
  if (elem !== undefined){
    return parseInt(elem.value);
  }
  return 0;
}

function get_skill_major(skill) {
  const query = "#skill-" + slug_name(skill) + "-is-major";
  const elem = document.querySelector(query);
  return elem.checked;
}

function update_sleep_indicator() {
  const elem = document.querySelector("#sleep");
  
  // Show if sum of major skill points is >= 10.
  var sum_majors = 0;
  for (const attr in skills) {
    for (const skill in skills[attr]) {
      if (get_skill_major(skills[attr][skill])) {
        sum_majors += get_skill_value(skills[attr][skill]);
      }
    }
  }
  if (sum_majors >= 10) {
    elem.hidden = false;
  } else {
    elem.hidden = true;
  }
}

function set_bonus(attr, value) {
  const attr_total = document.querySelector(".attr-total#" + slug_name(attr));
  if (value > 1){ 
    attr_total.innerHTML = "+" + value;
  } else {
    attr_total.innerHTML = "";
  }
}


/** Update an attribute based on each of its skills' values. */
function recalculate_attribute(attr) {
  if (attr === undefined){
    // Recalculate all!
    for (var i in skills){
      recalculate_attribute(i);
    }
    // Update sleep indicator.
    update_sleep_indicator();
    
    return;
  }

  var skill_values = 0;
  for (const i in skills[attr]){
    skill_values += get_skill_value(skills[attr][i]);
  }

  // Calculate the bonus.
  var bonus = 0;
  if (skill_values == 0){
    bonus = 1;
  } else if (skill_values < 5) {
    bonus = 2;
  } else if (skill_values < 8) {
    bonus = 3;
  } else if (skill_values < 10) {
    bonus = 4;
  } else if (skill_values >= 10) {
    bonus = 5;
  }

  // And set the value of the ticker.
  set_bonus(attr, bonus);
  return skill_values;
}

const SKILL_TEMPLATE = `
<div id="skill-SLUG" class="skill">
  <input id="skill-SLUG-is-major" class="skill-major" type="checkbox" onchange="update_sleep_indicator()"/>
  <label class="skill-label" for="skill-SLUG-is-major">LABEL</label>
<!--  <div class="skill-spacer"></div> -->
  <div class="controls">
    <span id="skill-SLUG-decrease" for="skill-SLUG-input" onclick="decrease_skill('#skill-SLUG-input')">[-]</span>
    <input id="skill-SLUG-input" class="skill-points" value="0" />
    <span id="skill-SLUG-increase" for="skill-SLUG-input" onclick="increase_skill('#skill-SLUG-input')">[+]</span>
  </div>
</div>`;

function populate_tracker() {
  const ROOT = document.querySelector("#tracker");
  for (const attr in skills) {
    ROOT.appendChild(new_element("<h2 class='attr'><div class='attr-header'>" + attr + "</div> <div class='attr-total' id='" + slug_name(attr) + "'>0</div></h2>"));

    for (const i in skills[attr]) {
      // Add the skill ticker.
      const skill = skills[attr][i];
      const creator = SKILL_TEMPLATE.replace(/SLUG/g, slug_name(skill)).replace(/LABEL/g, skill);
      const elem = new_element(creator);
      ROOT.appendChild(elem);
    }

    recalculate_attribute(attr);
  }
}

function reset() {
  each_skill((skill, args) => {
    set_skill_value(skill, 0);
  });
}
