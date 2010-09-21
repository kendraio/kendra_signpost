// $Id: module_filter_tab.js,v 1.1.2.11 2010/04/08 19:22:39 greenskin Exp $

Drupal.ModuleFilter = Drupal.ModuleFilter || {};
Drupal.ModuleFilter.textFilter = '';
Drupal.ModuleFilter.timeout;
Drupal.ModuleFilter.tabs = {};

Drupal.behaviors.moduleFilter = function() {
  // Set the focus on the module filter textfield.
  $('#edit-module-filter-name').focus();

  $('#module-filter-squeeze').css('min-height', $('#module-filter-tabs').height());

  $('#module-filter-left a.project-tab').each(function(i) {
    Drupal.ModuleFilter.tabs[$(this).attr('id')] = new Drupal.ModuleFilter.Tab(this);
  });

  // Move anchors to top of tabs.
  $('a.anchor', $('#module-filter-left')).remove().prependTo('#module-filter-tabs');

  $('#edit-module-filter-name').keyup(function() {
    if (Drupal.ModuleFilter.textFilter != $(this).val()) {
      Drupal.ModuleFilter.textFilter = this.value;
      if (Drupal.ModuleFilter.timeout) {
        clearTimeout(Drupal.ModuleFilter.timeout);
      }
      Drupal.ModuleFilter.timeout = setTimeout('Drupal.ModuleFilter.filter("' + Drupal.ModuleFilter.textFilter + '")', 500);
    }
  });

  Drupal.ModuleFilter.showEnabled = $('#edit-module-filter-show-enabled').is(':checked');
  $('#edit-module-filter-show-enabled').change(function() {
    Drupal.ModuleFilter.showEnabled = $(this).is(':checked');
    Drupal.ModuleFilter.filter($('#edit-module-filter-name').val());
  });
  Drupal.ModuleFilter.showDisabled = $('#edit-module-filter-show-disabled').is(':checked');
  $('#edit-module-filter-show-disabled').change(function() {
    Drupal.ModuleFilter.showDisabled = $(this).is(':checked');
    Drupal.ModuleFilter.filter($('#edit-module-filter-name').val());
  });
  Drupal.ModuleFilter.showRequired = $('#edit-module-filter-show-required').is(':checked');
  $('#edit-module-filter-show-required').change(function() {
    Drupal.ModuleFilter.showRequired = $(this).is(':checked');
    Drupal.ModuleFilter.filter($('#edit-module-filter-name').val());
  });
  Drupal.ModuleFilter.showUnavailable = $('#edit-module-filter-show-unavailable').is(':checked');
  $('#edit-module-filter-show-unavailable').change(function() {
    Drupal.ModuleFilter.showUnavailable = $(this).is(':checked');
    Drupal.ModuleFilter.filter($('#edit-module-filter-name').val());
  });

  // Check for anchor.
  var url = document.location.toString();
  if (url.match('#')) {
    // Make tab active based on anchor.
    var anchor = '#' + url.split('#')[1];
    $('a[href="' + anchor + '"]').click();
  }
  // Else if no active tab is defined, set it to the all tab.
  else if (Drupal.ModuleFilter.activeTab == undefined) {
    Drupal.ModuleFilter.activeTab = Drupal.ModuleFilter.tabs['all-tab'];
  }
}

Drupal.ModuleFilter.visible = function(checkbox) {
  if (Drupal.ModuleFilter.showEnabled) {
    if ($(checkbox).is(':checked') && !$(checkbox).is(':disabled')) {
      return true;
    }
  }
  if (Drupal.ModuleFilter.showDisabled) {
    if (!$(checkbox).is(':checked') && !$(checkbox).is(':disabled')) {
      return true;
    }
  }
  if (Drupal.ModuleFilter.showRequired) {
    if ($(checkbox).is(':checked') && $(checkbox).is(':disabled')) {
      return true;
    }
  }
  if (Drupal.ModuleFilter.showUnavailable) {
    if (!$(checkbox).is(':checked') && $(checkbox).is(':disabled')) {
      return true;
    }
  }
  return false;
}

Drupal.ModuleFilter.filter = function(string) {
  var stringLowerCase = string.toLowerCase();
  var flip = 'odd';

  if (Drupal.ModuleFilter.activeTab.id == 'all-tab') {
    var selector = '#projects tbody tr td > strong';
  }
  else {
    var selector = '#projects tbody tr.' + Drupal.ModuleFilter.activeTab.id + '-content td > strong';
  }

  $(selector).each(function(i) {
    var $row = $(this).parent().parent();
    var module = $(this).text();
    var moduleLowerCase = module.toLowerCase();

    if (moduleLowerCase.match(stringLowerCase)) {
      if (Drupal.ModuleFilter.visible($('td.checkbox input', $row))) {
        $row.removeClass('odd even');
        $row.addClass(flip);
        $row.show();
        flip = (flip == 'odd') ? 'even' : 'odd';
      }
      else {
        $row.hide();
      }
    }
    else {
      $row.hide();
    }
  });

  Drupal.ModuleFilter.setSpacerHeight();
}

Drupal.ModuleFilter.Tab = function(element) {
  this.id = $(element).attr('id');
  this.element = element;

  $(this.element).click(function() {
    Drupal.ModuleFilter.tabs[$(this).attr('id')].setActive();
  });
}

Drupal.ModuleFilter.Tab.prototype.setActive = function() {
  if (Drupal.ModuleFilter.activeTab) {
    $(Drupal.ModuleFilter.activeTab.element).parent().removeClass('active');
  }
  // Assume the default active tab is #all-tab. Remove its active class.
  else {
    $('#all-tab').parent().removeClass('active');
  }

  Drupal.ModuleFilter.activeTab = this;
  $(Drupal.ModuleFilter.activeTab.element).parent().addClass('active');
  Drupal.ModuleFilter.activeTab.displayRows();

  // Clear filter textfield and refocus on it.
  $('#edit-module-filter-name').val('');
  $('#edit-module-filter-name').focus();
}

Drupal.ModuleFilter.Tab.prototype.displayRows = function() {
  var flip = 'odd';

  if (Drupal.ModuleFilter.activeTab.id == 'all-tab' && Drupal.ModuleFilter.status == 'all') {
    $('#projects tbody tr').each(function(i) {
      $(this).removeClass('odd even');
      $(this).addClass(flip);
      flip = (flip == 'odd') ? 'even' : 'odd';
    });
    $('#projects tbody tr').show();
  }
  else {
    var selector = (Drupal.ModuleFilter.activeTab.id == 'all-tab') ? '#projects tbody tr' : '#projects tbody tr.' + this.id + '-content';
    $('#projects tbody tr').hide();
    $('#projects tbody tr').removeClass('odd even');
    $(selector).each(function(i) {
      if (Drupal.ModuleFilter.visible($('td.checkbox input', $(this)))) {
        $(this).addClass(flip);
        flip = (flip == 'odd') ? 'even' : 'odd';
        $(this).show();
      }
    });
  }
}
