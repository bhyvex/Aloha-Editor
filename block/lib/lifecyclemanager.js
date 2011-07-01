/*!
* Aloha Editor
* Author & Copyright (c) 2010 Gentics Software GmbH
* aloha-sales@gentics.com
* Licensed unter the terms of http://www.aloha-editor.com/license.html
*/

define([],
function() {
	"use strict";
	
	var
		jQuery = window.alohaQuery || window.jQuery, $ = jQuery,
		GENTICS = window.GENTICS,
		Aloha = window.Aloha;

	var LifecycleManager = new (Class.extend({

		defaults: {
			'block-type': 'DefaultBlock'
		},
		blockTypes: {},
		
		// container for all blocks
		// Key: ID, value: Block
		blocks: {},

		registerEventHandlers: function() {
			// Register event handlers for activating an Aloha Block
			$('.aloha-block').live('click', function() {
				var block = LifecycleManager.getBlock(this);
				if (!block.isActive()) {
					// We did not click on an active block
					LifecycleManager.deactivateActiveBlocks();
				}
				block.activate();
			});

			// Register event handlers for deactivating an Aloha Block
			$('body').live('click', function(event) {
				// TODO: also check if the user does stuff inside the property panel; as this should also be allowed.
				if (!$(event.target).is('.aloha-block')) {
					// We did not click on a aloha block,
					// so we need to disable the currently active blocks
					LifecycleManager.deactivateActiveBlocks();
				}
			});
		},
		
		/**
		 * Blockify a given element with the instance defaults
		 * Directly called when one does $.alohaBlock(instanceDefaults)
		 *
		 * @hide
		 */
		blockify: function(element, instanceDefaults) {
			var attributes, block;
			element = $(element);
			
			// TODO: check if object is already Block-ified
			
			attributes = this.getConfig(element, instanceDefaults);

			element.contentEditable(false);
			element.addClass('aloha-block');
			if (!element.attr('id')) {
				element.attr('id', GENTICS.Utils.guid());
			}

			if (!this.blockTypes[attributes['block-type']]) {
				Aloha.Log.error(this, 'Block Type ' + attributes['block-type'] + ' not found!');
				return;
			}
			block = new (this.blockTypes[attributes['block-type']])(element);
			block.attr(attributes);

			// Register block
			this.blocks[block.getId()] = block;

			block.render();
		},

		/**
		 * Only internal helper function
		 */
		deactivateActiveBlocks: function() {
			$('.aloha-block-active').each(function(index, element) {
				var block = LifecycleManager.getBlock(element);
				if (block) {
					block.deactivate();
				}
			});
		},
		
		/**
		 * Merges the config from different places, and return the merged config.
		 *
		 * @hide
		 */
		getConfig: function(blockElement, instanceDefaults) {
			// TODO: merge from plugin settings
			// TODO: What about double matches / overrides / multiple selectors applying?
			var settingsDefaults = {dummy: 'bar'};

			return $.extend(
				{},
				this.defaults,
				settingsDefaults,
				instanceDefaults,
				blockElement.data(),
				{	// Override the "about" property
					about: blockElement.attr('about')
				}
			);
		},
		
		/**
		 * Receive the Block instance, when ID or DOM node is given.
		 * 
		 * @param {String}|{DOMNode}
		 * @return {Block} Block instance
		 */
		getBlock: function(idOrDomNode) {
			var id;
			if (typeof idOrDomNode === 'object') {
				id = jQuery(idOrDomNode).attr('id');
			} else {
				id = idOrDomNode;
			}

			return this.blocks[id];
		},
		
		unregisterBlock: function(blockOrBlockId) {
			// TODO
		},
		
		registerBlockType: function(identifier, blockType) {
			this.blockTypes[identifier] = blockType;
		}
	}))();
	
	return LifecycleManager;
});
