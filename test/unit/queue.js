import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import Queue from "../../src/queue";

describe("`Queue` class", () => {

    describe("`push` method", () => {

        it("adds an element to the queue", () => {
            const q = new Queue();
            q.process = sinon.spy();
            const element = {};
            q.push(element);
            expect(q.queue).to.include(element);
        });

        it("triggers processing", () => {
            const q = new Queue();
            q.process = sinon.spy();
            const element = {};
            q.push(element);
            expect(q.process).to.have.callCount(1);
        });

    });

    describe("`process` method", () => {

        it("calls the consumer on each element of the queue", () => {
            const consumer = sinon.spy(() => true);
            const q = new Queue(consumer);
            q.queue = [0, 1, 2];
            q.process();
            expect(consumer).to.have.been.calledWith(0);
            expect(consumer).to.have.been.calledWith(1);
            expect(consumer).to.have.been.calledWith(2);
            expect(consumer).to.have.callCount(3);
        });

        it("removes elements from the queue", () => {
            const consumer = sinon.spy(() => true);
            const q = new Queue(consumer);
            q.queue = [0, 1, 2];
            q.process();
            expect(q.queue.length).to.equal(0);
        });

        it("doesn't remove elements from the queue if the consumer doesn't ack", () => {
            const consumer = sinon.spy(() => false);
            const q = new Queue(consumer);
            q.queue = [0, 1, 2];
            q.process();
            expect(consumer).to.have.been.calledWith(0);
            expect(consumer).to.have.callCount(1);
            expect(q.queue.length).to.equal(3);
        });

    });

    describe("`empty` method", () => {

        it("empties the queue", () => {
            const q = new Queue();
            q.process = sinon.spy();
            const element = {};
            q.push(element);
            expect(q.queue.length).to.equal(1);
            q.empty();
            expect(q.queue.length).to.equal(0);
        });

    });


});
