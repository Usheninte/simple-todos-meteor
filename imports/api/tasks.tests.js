/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'chai';
import { Accounts } from 'meteor/accounts-base';

import { Tasks } from './tasks.js';

if (Meteor.isServer) {
  describe('Tasks', () => {
    describe('methods', () => {
      let userId = Random.id();
      const username = 'userzero';

      before(() => {
        // Create user if not already created
        let user = Meteor.users.findOne({ username: username });
        if (!user) {
          userId = Accounts.createUser({
            username: username,
            email: username,
            password: '1234567890',
          });
        } else {
          userId = user._id;
        }
      });

      beforeEach(() => {
        Tasks.remove({});
        taskId = Tasks.insert({
          text: 'test task',
          createdAt: new Date(),
          owner: userId,
          username: 'tmeasday',
        });
      });

      it('Can insert task', () => {
        const addTask = Meteor.server.method_handlers['tasks.insert'];

        const invocation = { userId };
        let text = 'test text';

        addTask.apply(invocation, [text]);

        assert.equal(Tasks.find().count(), 2);
      });

      it('Can delete own task', () => {
        // Find the internal implementation of the task method so we can
        // test it in isolation
        const deleteTask = Meteor.server.method_handlers['tasks.remove'];

        // Set up a fake method invocation that looks like what the method expects
        const invocation = { userId };

        // Run the method with `this` set to the fake invocation
        deleteTask.apply(invocation, [taskId]);

        // Verify that the method does what we expected
        assert.equal(Tasks.find().count(), 0);
      });

      it('Can not insert task if not logged in', () => {
        const addTask = Meteor.server.method_handlers['tasks.insert'];

        const invocation = {};
        let text = 'test text';

        assert.throws(
          function() {
            addTask.apply(invocation, [text]);
          },
          Meteor.Error,
          '[not-authorized]',
        );

        assert.equal(Tasks.find().count(), 1);
      });

      it("Can not delete someone else's task", () => {
        // Set task to private
        let setToPrivate = true;
        Tasks.update(taskId, { $set: { private: setToPrivate } });

        const deleteTask = Meteor.server.method_handlers['tasks.remove'];
        const invocation = { userId };

        deleteTask.apply(invocation, [taskId]);

        assert.equal(Tasks.find().count(), 0);
      });

      it('Can set own task checked', () => {
        // set task as checked
        let setChecked = true;
        Tasks.update(taskId, { $set: { checked: setChecked } });

        const checkTasks = Meteor.server.method_handlers['tasks.setChecked'];
        const invocation = { userId };

        checkTasks.apply(invocation, [taskId, setChecked]);

        assert.equal(Tasks.find().count(), 1);
      });

      it("Can not set someone else's task checked", () => {
        let setChecked = false;
        Tasks.update(taskId, { $set: { checked: setChecked } });

        const checkTasks = Meteor.server.method_handlers['tasks.setChecked'];
        const invocation = {};

        assert.throws(
          function() {
            checkTasks.apply(invocation, [taskId, setChecked]);
          },
          Meteor.Error,
          '[not-authorized]',
        );

        assert.equal(Tasks.find().count(), 1);
      });

      it('Can set own task private', () => {
        let setToPrivate = true;
        Tasks.update(taskId, { $set: { private: setToPrivate } });

        const privateTask = Meteor.server.method_handlers['tasks.setPrivate'];
        const invocation = { userId };

        privateTask.apply(invocation, [taskId, setToPrivate]);

        assert.equal(Tasks.find().count(), 1);
      });

      it("Can not set someone else's task private", () => {
        let setToPrivate = false;
        Tasks.update(taskId, { $set: { private: setToPrivate } });

        const privateTask = Meteor.server.method_handlers['tasks.setPrivate'];
        const invocation = {};

        assert.throws(
          function() {
            privateTask.apply(invocation, [taskId, setToPrivate]);
          },
          Meteor.Error,
          '[not-authorized',
        );

        assert.equal(Tasks.find().count(), 1);
      });
    });
  });
}
