/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

import { assert } from 'chai';

import { Tasks } from './tasks.js';

if (Meteor.isServer) {
  describe('Tasks', () => {
    describe('methods', () => {
      const userId = Random.id();
      let taskId;

      beforeEach(() => {
        Tasks.remove({});
        taskId = Tasks.insert({
          text: 'test task',
          createdAt: new Date(),
          owner: userId,
          username: 'tmeasday',
        });
      });

      // it('can insert task', () => {
      //   const addTask = Meteor.server.method_handlers['tasks.insert'];

      //   const invocation = { userId };
      //   let text = 'test text';

      //   assert.throws(
      //     function() {
      //       addTask.apply(invocation, [text]);
      //     },
      //     Meteor.Error,
      //     '[not-authorized]',
      //   );

      //   assert.equal(Tasks.find().count(), 2);
      // });

      it('cannot delete task if not logged in', () => {
        const invocation = { userId };

        if (invocation === null) {
          Meteor.Error('Please login to add tasks.');
        }
      });

      it('can delete owned task', () => {
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

      // it("can not delete someone else's task", () => {
      //   const invocation = { userId };

      // });
    });
  });
}
